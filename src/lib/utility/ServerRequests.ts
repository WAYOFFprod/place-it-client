export default class ServerRequests {
  host: string
  csrf: string | undefined
  headers: any = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
  constructor(host: string) {
    this.host = host;
  }

  post = async (path: string, payload: Object) => {
    try {
      const response = await fetch(this.host + path,{
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, *cors, same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: this.headers,
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(payload), // body data type must match "Content-Type" header
      });
      
      this.xsrfCheck()
      
      const res = await response.json();


      return res;
    } catch(error) {
      console.error("Error:", error);
    }
  }

  get = async (path: string) => {
    try {
      const response = await fetch(this.host + path,
        {
          method: "GET", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "include", // include, *same-origin, omit
          headers: this.headers,
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        }
      );

      this.xsrfCheck()

      if(response.status == 200) {
        const res = await response.json();
        return res;
      }

      
      return true;
    } catch(error) {
      console.error("Error:", error);
      return false
    }
  }

  xsrfCheck() {
    const cookies = this.parseCookie(document.cookie)
    if('XSRF-TOKEN' in cookies) {
      this.headers["X-XSRF-Token"] = cookies['XSRF-TOKEN']
    } else {
      console.warn("no XSRF TOKEN in cookie")
    }
  }

  parseCookie = (str: string) => {
    const strings = str
      .split(';')
    let output: any = {};
    strings.forEach(string => {
      const splits = string.split('=');
      output[decodeURIComponent(splits[0])] = decodeURIComponent(splits[1])
    });
    return output
  }
}