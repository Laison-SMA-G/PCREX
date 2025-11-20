export const fixImageUrls = (req, res, next) => {
  // Intercept res.json
  const originalJson = res.json;

  res.json = function (data) {
    const fixUrl = (url) => {
      if (!url) return url;
      // Replace any spaces with a slash
      return url.replace(/\s+/g, '/');
    };

    const processItem = (item) => {
      if (item.images && Array.isArray(item.images)) {
        item.images = item.images.map(fixUrl);
      }
      if (item.image) {
        item.image = fixUrl(item.image);
      }
      return item;
    };

    if (Array.isArray(data)) {
      data = data.map(processItem);
    } else {
      data = processItem(data);
    }

    originalJson.call(this, data);
  };

  next();
};

export default fixImageUrls;