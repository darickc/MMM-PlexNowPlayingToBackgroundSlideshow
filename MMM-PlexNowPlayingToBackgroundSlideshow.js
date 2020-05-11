/* global Module */

/**
 * Magic Mirror
 * Module: MMM-MMM-PlexNowPlayingToBackgroundSlideshow
 *
 * By Darick Carpenter
 * MIT Licensed.
 */

/**
 * Register the module with the MagicMirror program
 */
Module.register('MMM-PlexNowPlayingToBackgroundSlideshow', {
  /**
   * The default configuration options
   */
  defaults: {
    serverProtocol: 'http', // "http" | "https"
    serverAddress: null,
    serverPort: 32400, // Integer, minimum 0
    xPlexToken: null,
    sendNotificationWhilePaused: true,
    usePostersWhenAvailable: false,
  },

  /**
   * Override the start function.  Set some instance variables and validate the selected
   * configuration options before loading the rest of the module.
   */
  start: function () {
    this.apixPlexToken = this.config.xPlexToken;
    this.apiBaseURL = this.config.serverProtocol + '://' + this.unTrailingSlashIt(this.config.serverAddress) + ':' + this.config.serverPort;
    let self = this;
    window.addEventListener('keydown', function (event) {
      //   console.log(JSON.stringify(event.keyCode));
      switch (event.keyCode) {
        case 37:
          self.sendNotification('BACKGROUNDSLIDESHOW_PREVIOUS');
          break;
        case 39:
          self.sendNotification('BACKGROUNDSLIDESHOW_NEXT');
          break;
        case 32:
          self.sendNotification('BACKGROUNDSLIDESHOW_PAUSE');
          break;
        case 13:
          self.sendNotification('BACKGROUNDSLIDESHOW_PLAY');
          break;
      }
    });
  },

  /**
   * Called when recieving notifications
   * @param {*} notification
   * @param {*} payload
   * @param {*} sender
   */
  notificationReceived: function (notification, payload, sender) {
    let self = this;
    if (sender) {
      if (notification === 'PLEXNOWPLAYING_UPDATE' && payload.plexData) {
        let urls = [];
        payload.plexData.forEach((item) => {
          if (self.config.sendNotificationWhilePaused || item.player.state === 'playing') {
            if (self.config.usePostersWhenAvailable && item.posterImg) {
              urls.push(self.buildURL(item.posterImg));
            } else if (self.config.usePostersWhenAvailable && item.seasonPosterImg) {
              urls.push(self.buildURL(item.seasonPosterImg));
            } else if (item.bannerImg) {
              urls.push(self.buildURL(item.bannerImg));
            } else if (item.seriesBannerImg) {
              urls.push(self.buildURL(item.seriesBannerImg));
            }
          }
        });
        this.sendNotification('BACKGROUNDSLIDESHOW_URLS', { urls: urls });
      }
    }
  },

  /**
   * The buildURL function takes an endpoint and wraps it in the base URL, port and plex token parameter
   *
   * @param endpoint (string) The endpoint to use when building the URL
   * @return (string) The fully qualified URL for the requested endpoint
   */
  buildURL: function (endpoint) {
    var self = this;
    endpoint = this.trailingSlashIt(endpoint);
    endpoint = this.leadingSlashIt(endpoint);
    return self.apiBaseURL + endpoint + '?X-Plex-Token=' + self.apixPlexToken;
  },

  /**
   * The trailingSlashIt function makes sure there is exactly one trailing slash after the input string
   *
   * @param input (string) The string apply the trailing slash to
   * @return (string) The input string with a single trailing slash
   */
  trailingSlashIt: function (input) {
    return this.unTrailingSlashIt(input) + '/';
  },

  /**
   * The unTrailingSlashIt function makes sure there is no trailing slash after the input string
   *
   * @param input (string) The string remove the trailing slash from
   * @return (string) The input string with no trailing slash
   */
  unTrailingSlashIt: function (input) {
    return input.replace(new RegExp('[\\/]+$'), '');
  },

  /**
   * The leadingSlashIt function makes sure there is exactly one leading slash at the beginning of the input string
   *
   * @param input (string) The string apply the leading slash to
   * @return (string) The input string with a single slash at the beginning
   */
  leadingSlashIt: function (input) {
    return '/' + this.unLeadingSlashIt(input);
  },

  /**
   * The unLeadingSlashIt function makes sure there is no leading slash at the beginning of the input string
   *
   * @param input (string) The string remove the leading slash from
   * @return (string) The input string with no slashes at the beginning
   */
  unLeadingSlashIt: function (input) {
    return input.replace(new RegExp('^[\\/]+'), '');
  },
});
