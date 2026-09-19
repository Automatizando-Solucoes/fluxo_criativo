import base64
import importlib.util
from pathlib import Path

spec = importlib.util.spec_from_file_location('gemini_runtime', Path(__file__).parents[2] / 'scripts' / 'gemini-nano-banana-runtime.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

png = base64.b64encode(bytes.fromhex('89504e470d0a1a0a00000000')).decode('ascii')
body = {
    'id': 'interaction-safe-id',
    'steps': [
        {'type': 'model_output', 'content': [{'type': 'text', 'text': 'imagem pronta'}, {'type': 'image', 'mime_type': 'image/png', 'data': png}]}
    ],
}
result = module.extract_output_image(body)
assert result == {'id': 'interaction-safe-id', 'output_image': {'data': png, 'mime_type': 'image/png'}}
assert module.extract_output_image({'id': 'safe', 'steps': []}) is None
print('Gemini runtime REST extraction: ok')
