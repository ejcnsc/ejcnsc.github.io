function fromBinary(binary) {
    const bytes = Uint8Array.from({ length: binary.length }, (element, index) =>
      binary.charCodeAt(index)
    );
    const charCodes = new Uint16Array(bytes.buffer);
  
    let result = "";
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });
    return result;
}

  function toBinary(string) {
    const codeUnits = Uint16Array.from(
      { length: string.length },
      (element, index) => string.charCodeAt(index)
    );
    const charCodes = new Uint8Array(codeUnits.buffer);
  
    let result = "";
    charCodes.forEach((char) => {
      result += String.fromCharCode(char);
    });
    return result;
  }

  function encode64(str){
    const converted = toBinary(str);
    const encoded = btoa(converted);
    return encoded;
  }

  function decode64(str){
    const decoded = atob(str);
    const original = fromBinary(decoded);
    return original;
  }