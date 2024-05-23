const Hapi = require('@hapi/hapi');
const routes = require('./routes');
const tf = require("@tensorflow/tfjs-node");

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
  });
 
  server.route(routes);
  
  const ModelURL = "https://storage.googleapis.com/savedmodelcancer-was/model.json"
  const model = await tf.loadGraphModel(ModelURL);
  server.app.model = model;

  server.ext("onPreResponse", function (request, h) {
    const res = request.response;

    if (res instanceof InputError) {
        const Response = h.response({
            status: "fail",
            message: "Terjadi kesalahan dalam melakukan prediksi",
        });
        Response.code(400);
        return Response;
    }

    if (res.isBoom) {
        const Response = h.response({
            status: "fail",
            message: res.message,
        });
        Response.code(413);
        return Response;
    }
    return h.continue;
  });

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
 
 
init();
