angular.module('myApp.apiSearcher', ['ngRoute']).factory("APIService", function($http) {
  const api = {
    topArtists: null,
    topTracks: null,
    artist: null,
    artistAlbums: null,
    artistTracks: null,
    artistSimilar: null
  }
  const urlBase = "http://ws.audioscrobbler.com/2.0/?method="
  const apiKey = "0e88f43c5248ff6fd1e662925b8cad52"
  const urlEnd = `&api_key=${apiKey}&format=json`
  const urls = {
    topArtists: `${urlBase}chart.gettopartists${urlEnd}&limit=5`,
    topTracks: `${urlBase}chart.gettoptracks${urlEnd}&limit=10`,
    artist: `${urlBase}artist.getinfo${urlEnd}&lang=PT`,
    artistTopAlbums: `${urlBase}artist.gettopalbums${urlEnd}&limit=5`,
    artistTopTracks: `${urlBase}artist.gettoptracks${urlEnd}&limit=10`,
    artistSimilar: `${urlBase}artist.getsimilar${urlEnd}&limit=8`
  }

  /** 
   * retorna uma imagem buscada no spotify
   * através de um script de busca do bing
   * @param {string} artistName nome do artista/álbum
   * @param {string} type 'artist' ou 'album'
   * @return {string} url da imagem
   */
  function getArt (name, type="artist") {
    const query = `${name} ${type} spotify.com`
    return `https://tse2.mm.bing.net/th?q=${query}&w=300&h=300&c=7&rs=1&p=0&dpr=3&pid=1.7&mkt=en-IN&adlt=on`
  }

  /**
   * retorna a URL da página de um artista neste aplicativo
   * usa MBID se o artista o possuir, nome do contrário
   * @param {object} artist objeto artista
   * @return {string} url do artista
   */
  function getLink (artist) {
    if (artist.mbid && artist.mbid !== "") {
      return `#!/artist/mbid/${artist.mbid}`
    } else {
      return `#!/artist/name/${artist.name}`
    }
  }

  /**
   * retorna um número formatado com pontos
   * a cada três casas decimais
   * @param {integer} num um número
   * @return {string} uma string do número formatado
   */
  function decimalDots(num) {
    return num.toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')
  }

  api.getArtistTopAlbums = function(artist) {
    const albumsUrl = artist.mbid && artist.mbid !== "" ? `${urls.artistTopAlbums}&mbid=${artist.mbid}` : `${urls.artistTopAlbums}&artist=${artist.name}`

    const response = $http.get(albumsUrl).then((response) => {
      const albums = response.data.topalbums.album.slice(0,5)
      const albumsWithImages = albums.map((album) => {
        album.image = getArt(`${album.artist.name} ${album.name}`, 'album')
        album.playcount = decimalDots(album.playcount)
        return album
      })
      api.artistAlbums = albumsWithImages
    }).catch(e => api.artistAlbums = false)
    return response
  }

  api.getArtistTopTracks = function(artist) {
    const tracksUrl = artist.mbid && artist.mbid !== "" ? `${urls.artistTopTracks}&mbid=${artist.mbid}` : `${urls.artistTopTracks}&artist=${artist.name}`
    
    const response = $http.get(tracksUrl).then((response) => {
      const tracks = response.data.toptracks.track.slice(0,10)
      api.artistTracks = tracks
    }).catch(e => api.artistTracks = false)

    return response
  }

  api.getArtistSimilar = function(artist) {
    const similarUrl = artist.mbid && artist.mbid !== "" ? `${urls.artistSimilar}&mbid=${artist.mbid}` : `${urls.artistSimilar}&artist=${artist.name}`

    const response = $http.get(similarUrl).then((response) => {
      const artists = response.data.similarartists.artist.slice(0,8)
      const artistsWithImages = artists.map((artist) => {
        artist.image = getArt(artist.name)
        artist.href= getLink(artist)
        return artist
      })
      api.artistSimilar = artistsWithImages
    })
    return response
  }

  api.getTopArtists = function(){
    const response = $http.get(urls['topArtists']).then((response) => {
      const artists = response.data.artists.artist.slice(0,5)
      let artistsWithImages = artists.map(function(artist) {
        artist.image = getArt(artist.name)
        artist.href = getLink(artist)
        artist.listeners = decimalDots(artist.listeners)
        return artist
      })
      api.topArtists = artistsWithImages
    }).catch(e => api.topArtists = false)
    return response
  }

  api.getTopTracks = function(){
    const response = $http.get(urls['topTracks']).then((response) => {
      const nineTracks = response.data.tracks.track.slice(0,9)
      let tracksWithImages = nineTracks.map(function(item) {
        item.image = getArt(item.artist.name)
        return item
      })
      api.topTracks = tracksWithImages
    }).catch(e => api.topTracks = false)
    return response
  }

  api.getArtist = function(param, paramType="mbid") {
    const artistUrl = paramType === "mbid" ? `${urls.artist}&mbid=${param}` : `${urls.artist}&artist=${param}`
   
    const response = $http.get(artistUrl).then((response) => {
      const artist = response.data.artist
      artist.image = getArt(artist.name)
      api.artist = artist
    }).catch(e => api.artist = false)
    
    return response
  }

  return api
} )