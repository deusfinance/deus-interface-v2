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
        source: '/vdeus',
        destination: '/xdeus',
        permanent: false,
      },
      {
        source: '/vdeus/swap',
        destination: '/xdeus/swap',
        permanent: false,
      },
      {
        source: '/vdeus/stake',
        destination: '/xdeus/stake',
        permanent: false,
      },
      {
        source: '/migrator',
        destination: 'https://legacy.dei.finance/migration',
        permanent: false,
      },
      // {
      //   source: '/bridge',
      //   destination: 'https://app.multichain.org/#/router',
      //   permanent: false,
      // },
    ]
  },
}
