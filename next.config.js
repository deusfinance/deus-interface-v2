module.exports = {
  images: {
    domains: ['raw.githubusercontent.com', 'assets.spooky.fi'],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/clqdr',
        permanent: true,
      },
      {
        source: '/migrator',
        destination: 'https://legacy.dei.finance/migration',
        permanent: false,
      },
      {
        source: '/bridge',
        destination: 'https://app.multichain.org/#/router',
        permanent: false,
      },
    ]
  },
}
