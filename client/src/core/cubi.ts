import { APIInterface } from "./APIInterface";

class Cubi {
  api: APIInterface;

  constructor() {
    this.api = new APIInterface();
  }
}

const cubi = new Cubi();
export default cubi;
