const cloudinary = require('cloudinary').v2;
cloudinary.config({
  cloud_name: 'dwol6aarv',
  api_key: '785929123196129',
  api_secret: 'JYOffQNDHCG15PVSFxoZT4FuGvk'
});
cloudinary.search.expression('folder:"Mẫu ảnh"').max_results(50).execute().then(result => {
  console.log(JSON.stringify(result.resources.map(r => ({ url: r.secure_url, name: r.filename })), null, 2));
}).catch(console.error);
