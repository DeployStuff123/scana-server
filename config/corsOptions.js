const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  'https://edu-quest-admin.vercel.app',
  'https://edu-quest-silk.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

export default corsOptions;