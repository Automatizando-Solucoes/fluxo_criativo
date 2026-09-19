#!/usr/bin/env python3
"""Nano Banana runtime: reads secret only from child-process environment."""
import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'
MAX_RESPONSE_BYTES = 25 * 1024 * 1024


def fail(message, status=None):
    output = {'ok': False, 'error': message}
    if status is not None:
        output['http_status'] = status
    return output


def extract_output_image(body):
    """Extract the last image block from the raw Interactions REST response."""
    steps = body.get('steps')
    if not isinstance(steps, list):
        return None
    for step in reversed(steps):
        if not isinstance(step, dict) or step.get('type') != 'model_output':
            continue
        content = step.get('content')
        if not isinstance(content, list):
            continue
        for block in reversed(content):
            if isinstance(block, dict) and block.get('type') == 'image' and isinstance(block.get('data'), str):
                return {'id': body.get('id'), 'output_image': {'data': block['data'], 'mime_type': block.get('mime_type', 'image/png')}}
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--request', required=True)
    parser.add_argument('--response', required=True)
    args = parser.parse_args()
    request = json.loads(Path(args.request).read_text(encoding='utf-8'))
    key = os.environ.get('GEMINI_API_KEY')
    if not key:
        result = fail('gemini_secret_unavailable')
    else:
        payload = json.dumps({
            'model': request['model'],
            'input': [{'type': 'text', 'text': request['prompt']}],
        }).encode('utf-8')
        http_request = urllib.request.Request(URL, data=payload, method='POST', headers={'Content-Type': 'application/json', 'x-goog-api-key': key})
        try:
            with urllib.request.urlopen(http_request, timeout=90) as response:
                raw = response.read(MAX_RESPONSE_BYTES + 1)
            if len(raw) > MAX_RESPONSE_BYTES:
                result = fail('gemini_response_too_large')
            else:
                body = json.loads(raw)
                result = extract_output_image(body)
                if result is None:
                    result = fail('gemini_image_missing')
                else:
                    result['ok'] = True
        except urllib.error.HTTPError as error:
            provider_status = None
            field_paths = []
            try:
                error_body = json.loads(error.read(MAX_RESPONSE_BYTES).decode('utf-8'))
                provider_error = error_body.get('error', {}) if isinstance(error_body, dict) else {}
                if isinstance(provider_error.get('status'), str):
                    provider_status = provider_error['status']
                for detail in provider_error.get('details', []):
                    for violation in detail.get('fieldViolations', []) if isinstance(detail, dict) else []:
                        field = violation.get('field') if isinstance(violation, dict) else None
                        if isinstance(field, str) and len(field) <= 200:
                            field_paths.append(field)
            except (ValueError, UnicodeDecodeError):
                pass
            result = fail('gemini_http_error', error.code)
            if provider_status:
                result['provider_status'] = provider_status
            if field_paths:
                result['invalid_fields'] = sorted(set(field_paths))
        except (urllib.error.URLError, TimeoutError):
            result = fail('gemini_network_error')
        except (ValueError, KeyError):
            result = fail('gemini_invalid_response')
    Path(args.response).write_text(json.dumps(result), encoding='utf-8')
    return 0 if result.get('ok') else 2


if __name__ == '__main__':
    sys.exit(main())
