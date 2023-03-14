import { Uri, workspace } from 'vscode';
import { Logger } from '../utils/logger';

//Hacky way to get Text(En|De)code work in both Node and Webworker environments
const globalObj: any = globalThis;
const decoder = new globalObj.TextDecoder();
const encoder = new globalObj.TextEncoder();

export async function exists(pathOrUri: string | Uri): Promise<boolean> {
  const uri = getUri(pathOrUri);
  try {
    Logger.log('Checking ' + uri);
    await workspace.fs.stat(uri);
    return true;
  } catch (e) {
    Logger.log(uri + ' doesn\'t exist');
    return false;
  }
}
export async function readFile(pathOrUri: string | Uri): Promise<string> {
  const uri = getUri(pathOrUri);
  Logger.log('Reading ' + uri);
  const read = await workspace.fs.readFile(uri);
  return decoder.decode(read);
}

export async function writeFile(pathOrUri: string | Uri, content: string): Promise<void> {
  const uri = getUri(pathOrUri);
  await ensureParentExists(uri);
  Logger.log('Writing ' + uri);
  const contentAsUint8Array = encoder.encode(content);
  return workspace.fs.writeFile(uri, contentAsUint8Array);
}

export async function mkdir(pathOrUri: string | Uri): Promise<void> {
  const uri = getUri(pathOrUri);
  Logger.log('Creating ' + uri);
  await workspace.fs.createDirectory(uri);
}

export async function deleteFile(pathOrUri: string | Uri): Promise<void> {
  const uri = getUri(pathOrUri);
  Logger.log('Deleting ' + uri);
  return workspace.fs.delete(uri);
}

export async function ensureParentExists(uri: Uri): Promise<void> {
  const parent = Uri.joinPath(uri, '..');
  if (!(await exists(parent))) {
    await mkdir(parent);
  }
}

function getUri(pathOrUri: string | Uri): Uri {
  if (pathOrUri instanceof Uri) {
    return pathOrUri;
  }
  return Uri.file(pathOrUri);
}