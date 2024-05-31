import ServerRequests from "./serverRequests";

export default class CanvasRequest {
  requester: ServerRequests

  constructor() {
    this.requester = new ServerRequests('http://localhost/api');
  }

  getCanva = async (id: number = 1) => {
    const response = await this.requester.get("/canva/"+id);
    return response;
  }
}