export const removePrefix = (encodedString: string) => {
    const prefix = "base64-";
  
    if (encodedString.startsWith(prefix)) {
      return encodedString.slice(prefix.length); 
    }
  
    return encodedString; 
  };