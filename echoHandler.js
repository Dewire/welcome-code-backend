module.exports.echo = (event, ctx, cb) => {
  cb(null, event.body);
};
