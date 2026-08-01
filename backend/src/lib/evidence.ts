import { createHash } from 'node:crypto';

export type ScanStatus = 'pending' | 'clean' | 'quarantined' | 'failed';

const BLOCKED_MIME_PREFIXES = ['application/x-msdownload', 'application/x-dosexec', 'application/vnd.microsoft.portable-executable'];
const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.cmd', '.ps1', '.scr', '.js', '.vbs', '.msi'];

export function sha256Hex(data: Buffer | string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function heuristicMalwareScan(input: {
  filename: string;
  mime: string;
  sizeBytes: number;
}): { status: ScanStatus; notes: string } {
  const lower = input.filename.toLowerCase();
  if (BLOCKED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
    return { status: 'quarantined', notes: 'Blocked executable extension' };
  }
  if (BLOCKED_MIME_PREFIXES.some((m) => input.mime.startsWith(m))) {
    return { status: 'quarantined', notes: 'Blocked MIME type' };
  }
  if (input.sizeBytes <= 0) {
    return { status: 'failed', notes: 'Empty object' };
  }
  if (input.sizeBytes > 80_000_000) {
    return { status: 'quarantined', notes: 'Object exceeds scan size policy' };
  }
  return { status: 'clean', notes: 'Heuristic scan passed' };
}

export function verifySha256(expected: string, actual: string): boolean {
  return expected.toLowerCase() === actual.toLowerCase() && /^[a-f0-9]{64}$/i.test(expected);
}
