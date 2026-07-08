import os
from abc import ABC, abstractmethod

from PIL import Image

from sprite_tools import remove_chroma_key, remove_chroma_key_soft


class Upscaler(ABC):
    """
    Shared batch/file orchestration for every upscaling approach. Subclasses only
    implement scale() (the actual pixel transform) and, when relevant, declare
    alpha_native.

    Most upscalers here (hqx, nearest-neighbor, most ESRGAN checkpoints) never saw
    transparency during training/design — they operate on an opaque, flat-background
    image, and the background is keyed out to alpha *afterward* with a soft/graded
    dekey to absorb whatever blending the upscaler did on that flat color.

    A checkpoint trained directly on RGBA sprites (alpha_native = True) skips that:
    the flat background is keyed to real transparency *first* (a plain hard dekey,
    since the un-upscaled sprite has no anti-aliasing to fade), and the network
    upscales the already-transparent RGBA image straight through.
    """

    alpha_native = False

    @property
    def name(self):
        return type(self).__name__

    @abstractmethod
    def scale(self, image):
        """Scale a single PIL Image (RGB, or RGBA if alpha_native) and return it."""

    def process_file(self, input_path, output_path, key_color=None):
        if self.alpha_native:
            keyed_path = f"{output_path}.tmp_keyed.png"
            remove_chroma_key(input_path, keyed_path, key_color)
            out = self.scale(Image.open(keyed_path).convert('RGBA'))
            os.remove(keyed_path)
            out.save(output_path)
        else:
            out = self.scale(Image.open(input_path).convert('RGB'))
            flatbg_path = f"{output_path}.tmp_flatbg.png"
            out.save(flatbg_path)
            remove_chroma_key_soft(flatbg_path, output_path, key_color)
            os.remove(flatbg_path)

        print(f"{self.name} scaled: {input_path} -> {output_path} ({out.size[0]}x{out.size[1]})")

    def process_batch(self, input_paths, output_dir, key_color=None):
        os.makedirs(output_dir, exist_ok=True)

        print(f"\nUpscaling {len(input_paths)} file(s) with {self.name}...")
        print("=" * 60)

        for input_path in input_paths:
            stem, ext = os.path.splitext(os.path.basename(input_path))
            output_path = os.path.join(output_dir, f"{stem}_{self.name}{ext}")
            self.process_file(input_path, output_path, key_color)


class NearestNeighborUpscaler(Upscaler):
    """Plain integer scale, no blending of any kind — zero halo risk by construction."""

    def __init__(self, factor):
        self.factor = factor

    @property
    def name(self):
        return f"nn{self.factor}x"

    def scale(self, image):
        w, h = image.size
        return image.resize((w * self.factor, h * self.factor), Image.NEAREST)


class HqxUpscaler(Upscaler):
    """hq2x/hq3x/hq4x. Requires the 'hqx' package (see scripts/.venv — it needs an
    older Pillow than the system interpreter has, see README/conversation history)."""

    def __init__(self, factor):
        if factor not in (2, 3, 4):
            raise ValueError("factor must be 2, 3, or 4")
        self.factor = factor

    @property
    def name(self):
        return f"hq{self.factor}x"

    def scale(self, image):
        import hqx as _hqx

        scale_fn = {2: _hqx.hq2x, 3: _hqx.hq3x, 4: _hqx.hq4x}[self.factor]
        return scale_fn(image)


class EsrganUpscaler(Upscaler):
    """
    Any old-arch ESRGAN checkpoint compatible with esrgan_arch.RRDBNet. Pass one of
    esrgan_arch.KNOWN_MODELS, or a custom ESRGANConfig for an unlisted checkpoint.

    alpha_native follows from the config: a 4-channel checkpoint (e.g. gen5_alpha)
    was trained on RGBA sprites directly, so no post-hoc dekey pass is needed.

    Requires torch (scripts/.venv/bin/python) and the .pth weights at model_path.
    """

    def __init__(self, model_path, config, name=None):
        self.model_path = model_path
        self.config = config
        self._name = name or os.path.splitext(os.path.basename(model_path))[0]
        self._net = None

    @property
    def name(self):
        return self._name

    @property
    def alpha_native(self):
        return self.config.in_nc == 4

    def _net_instance(self):
        if self._net is None:
            import torch

            net = self.config.build()
            net.load_state_dict(torch.load(self.model_path, map_location='cpu'))
            net.eval()
            self._net = net
        return self._net

    def scale(self, image):
        import numpy as np
        import torch

        net = self._net_instance()
        mode = 'RGBA' if self.config.in_nc == 4 else 'RGB'
        tensor = torch.from_numpy(np.array(image.convert(mode))).permute(2, 0, 1).float().div(255.0).unsqueeze(0)

        with torch.no_grad():
            out = net(tensor).clamp(0.0, 1.0)

        out_arr = out.squeeze(0).permute(1, 2, 0).mul(255.0).round().byte().numpy()
        return Image.fromarray(out_arr, mode=mode)
