import axios from 'axios';

class CacheUtility {
  static CACHE_KEY = 'myCache';

  static getCache() {
    const cacheData = localStorage.getItem(this.CACHE_KEY);
    if (cacheData) {
      const cache = JSON.parse(cacheData);
      return cache;
    }
    return {};
  }

  static setCache(cache) {
    const cacheData = JSON.stringify(cache);
    localStorage.setItem(this.CACHE_KEY, cacheData);
  }

  static async fetchData(url) {
    const cache = this.getCache();

    if (cache[url] && cache[url].expires > Date.now()) {
      // If data is already in cache and not expired, return it
      console.log(this.b64toBlob(cache[url].data));
      return Promise.resolve(this.b64toBlob(cache[url].data));
    } else {
      // Fetch data from the external link using Axios
      const response = await axios.get(url, { responseType: 'blob' });
      const data = response.data;
      const b64Image = await this.convertBlobToBase64(data);
      // Cache the data with expiration time
      cache[url] = {
        data: b64Image,
        expires: Date.now() + 60 * 60 * 1000, // Set expiration time to one hour
      };
      this.setCache(cache);
      return data;
    }
  }

  static b64toBlob(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  static convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        resolve(reader.result.split(',')[1]);
      };
      reader.readAsDataURL(blob);
    });
  }
}

export default CacheUtility;
