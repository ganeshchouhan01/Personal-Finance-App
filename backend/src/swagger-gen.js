import swaggerAutogen from 'swagger-autogen';

const swaggerGen = swaggerAutogen();

const doc = {
  info: {
    title: 'Personal Finance Tracker API',
    description: 'Auto-generated Swagger docs',
  },
  host: 'localhost:5000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
  './server.js',
  './routes/auth.js',
  './routes/transactions.js',
  './routes/dashboard.js',
  './routes/analytics.js',
  './routes/export.js',
  './routes/budgets.js'
];

swaggerGen(outputFile, endpointsFiles, doc);
