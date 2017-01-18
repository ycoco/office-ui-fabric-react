import 'es6-promise';

export class LocalFileReader {

  public static readFile(
    file: File
  ): Promise<string> {
    if (!file) {
      return Promise.resolve('');
    }

    const reader: FileReader = new FileReader();

    return new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        return resolve(reader.result);
      };
      reader.onerror = (ev: ErrorEvent) => {
        return reject(ev.error);
      };
      reader.readAsDataURL(file);
    });
  }
}