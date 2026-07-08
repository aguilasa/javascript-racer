"""
Old-arch ESRGAN (RRDBNet) generator, matching the state_dict layout used by
community-shared "victorca25/BlueAmulet ESRGAN" .pth files (a single `model`
Sequential with RRDB trunk blocks under `model.1.sub.*`).

Different checkpoints from OpenModelDB vary in channel count (RGB vs RGBA) and how
many 2x upsample stages are chained (2x vs 4x total scale) — ESRGANConfig captures
that per-checkpoint shape so RRDBNet stays a single reusable network definition.
"""

from dataclasses import dataclass

import torch
import torch.nn as nn


class ResidualDenseBlock5C(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.conv1 = nn.Sequential(nn.Conv2d(nf, gc, 3, 1, 1), nn.LeakyReLU(0.2, True))
        self.conv2 = nn.Sequential(nn.Conv2d(nf + gc, gc, 3, 1, 1), nn.LeakyReLU(0.2, True))
        self.conv3 = nn.Sequential(nn.Conv2d(nf + 2 * gc, gc, 3, 1, 1), nn.LeakyReLU(0.2, True))
        self.conv4 = nn.Sequential(nn.Conv2d(nf + 3 * gc, gc, 3, 1, 1), nn.LeakyReLU(0.2, True))
        self.conv5 = nn.Sequential(nn.Conv2d(nf + 4 * gc, nf, 3, 1, 1))

    def forward(self, x):
        x1 = self.conv1(x)
        x2 = self.conv2(torch.cat((x, x1), 1))
        x3 = self.conv3(torch.cat((x, x1, x2), 1))
        x4 = self.conv4(torch.cat((x, x1, x2, x3), 1))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x


class RRDB(nn.Module):
    def __init__(self, nf=64, gc=32):
        super().__init__()
        self.RDB1 = ResidualDenseBlock5C(nf, gc)
        self.RDB2 = ResidualDenseBlock5C(nf, gc)
        self.RDB3 = ResidualDenseBlock5C(nf, gc)

    def forward(self, x):
        out = self.RDB1(x)
        out = self.RDB2(out)
        out = self.RDB3(out)
        return out * 0.2 + x


class ShortcutBlock(nn.Module):
    def __init__(self, submodule):
        super().__init__()
        self.sub = submodule

    def forward(self, x):
        return x + self.sub(x)


class RRDBNet(nn.Module):
    def __init__(self, in_nc=3, out_nc=3, nf=64, nb=23, gc=32, num_upsamples=2):
        super().__init__()
        trunk = [RRDB(nf, gc) for _ in range(nb)]
        trunk.append(nn.Conv2d(nf, nf, 3, 1, 1))

        layers = [
            nn.Conv2d(in_nc, nf, 3, 1, 1),
            ShortcutBlock(nn.Sequential(*trunk)),
        ]
        for _ in range(num_upsamples):
            layers += [
                nn.Upsample(scale_factor=2, mode='nearest'),
                nn.Conv2d(nf, nf, 3, 1, 1),
                nn.LeakyReLU(0.2, True),
            ]
        layers += [
            nn.Conv2d(nf, nf, 3, 1, 1),
            nn.LeakyReLU(0.2, True),
            nn.Conv2d(nf, out_nc, 3, 1, 1),
        ]
        self.model = nn.Sequential(*layers)

    def forward(self, x):
        return self.model(x)


@dataclass(frozen=True)
class ESRGANConfig:
    """
    Shape parameters for one checkpoint. num_upsamples is how many 2x
    nearest-neighbor+conv stages RRDBNet chains (1 => 2x total scale, 2 => 4x).
    in_nc/out_nc == 4 means the checkpoint was trained on RGBA and can upscale
    straight through an already-transparent sprite (see Upscaler.alpha_native
    in upscalers.py) instead of needing a flat background keyed out afterward.
    """
    in_nc: int = 3
    out_nc: int = 3
    nf: int = 64
    nb: int = 23
    gc: int = 32
    num_upsamples: int = 2

    def build(self):
        return RRDBNet(self.in_nc, self.out_nc, self.nf, self.nb, self.gc, self.num_upsamples)


# Known OpenModelDB checkpoints this architecture loads (all 64nf/23nb old-arch ESRGAN).
# 'sgi' is the current default for the OutRun Ferrari sprites: trained on 90s
# pre-rendered CGI, which matches this sprite's origin better than the others tried
# (pixelperfectv4/fatal_pixels/xbrz are anime-trained) — see conversation/doc for the
# side-by-side comparison this was picked from.
DEFAULT_MODEL = 'sgi'

KNOWN_MODELS = {
    'pixelperfectv4': ESRGANConfig(),
    'fatal_pixels': ESRGANConfig(),
    'xbrz': ESRGANConfig(),
    'gen5_alpha': ESRGANConfig(in_nc=4, out_nc=4, num_upsamples=1),
    'sgi': ESRGANConfig(),
    # 1x restoration filter (dedither), no upsample stage at all — run before/instead
    # of an upscaler, not as one.
    'dither_deleter_v3_smooth': ESRGANConfig(num_upsamples=0),
}
