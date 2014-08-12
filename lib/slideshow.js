(function ($) {



  /* HELPER METHODS */
  var inheritMethods = function (Parent) {
    var Surrogate = function () {};
    Surrogate.prototype = Parent.prototype;
    return new Surrogate();
  };



  /* SLIDESHOW BASE CLASS */
  var SlideshowBase = function (el, childSelector, slideshowOptions) {
    this.$el = this.$el || el;
    this.$child = this.$el.find(childSelector);
    this.defaults = {
      startingChild: 0,
      slideCount: this.$child.length,
      navSelector: '.slideshow-nav'
    };
    this.setDefaults(slideshowOptions);
    this.currentSlide = this.options.startingChild;
    this.initializeStyles();
    this.initializeNav();
    this.showFirstSlide();
  };

  SlideshowBase.prototype.showFirstSlide = function () {
    this.$child.eq(this.options.startingChild).show();
  };

  SlideshowBase.prototype.setDefaults = function (options) {
    var resultingOptions = $.extend(true, {}, this.defaults);
    for (var option in options) {
      resultingOptions[option] = options[option];
    }
    this.options = resultingOptions;
  };

  SlideshowBase.prototype.setStyles = function ($el, styleObject) {
    for (var key in styleObject) {
      $el.css(key, styleObject[key]);
    }
  };

  SlideshowBase.prototype.initializeStyles = function () {
    var styles = this.styles;
    var stylesHash = {
      child: this.$child,
      parent: this.$el
    };
    for (var styleType in stylesHash) {
      this.setStyles(stylesHash[styleType], styles[styleType]);
    }
  };

  SlideshowBase.prototype.initializeNav = function () {
    var $navEls = $(this.options.navSelector);
    $navEls.click(this.handleNavClick.bind(this));
  };

  SlideshowBase.prototype.move = function (direction) {
    var slideCount = this.options.slideCount;
    var nextSlideIndex = this.currentSlide;
    switch (direction) {
      case 'next':
        if (this.currentSlide === slideCount - 1) {
          nextSlideIndex = 0;
        } else {
          nextSlideIndex++;
        }
        break;
      case 'prev':
        if (this.currentSlide === 0) {
          nextSlideIndex = slideCount - 1;
        } else {
          nextSlideIndex--;
        }
        break;
    }
    this.transition(nextSlideIndex);
  };

  SlideshowBase.prototype.transition = function () {
    throw "Called abstract method SlideshowBase.prototype.transition"
  };

  SlideshowBase.prototype.handleNavClick = function (e) {
    e.preventDefault();
    var direction = $(e.target).data('slideshow-direction');
    this.move(direction);
  };

  

  /* FADING SLIDESHOW SUBCLASS */
  var Fading = function () {
    this.styles = {
      parent: {
      },
      child: {
        position: 'absolute',
        left: '0px',
        top: '0px',
        right: '0px',
        bottom: '0px',
        display: 'none'
      }
    };
    SlideshowBase.apply(this, arguments);
  };

  Fading.prototype = inheritMethods(SlideshowBase);

  Fading.prototype.transition = function (nextSlideIndex) {
    var duration = this.options.fadeTime;
    this.$child.eq(this.currentSlide).fadeOut(duration);
    this.$child.eq(nextSlideIndex).fadeIn(duration);
    this.currentSlide = nextSlideIndex;
  };

  


  /* SLIDING SLIDESHOW SUBCLASS */
  var Sliding = function () {
    this.$el = arguments[0];
    var slideCount = arguments[2].slideCount || this.$el.find(arguments[1]).length;
    this.width = parseInt(this.$el.css('width'), 10);
    this.styles = {
      parent: {
        width: this.width * slideCount,
        position: 'relative'
      },
      child: {
        display: 'inline-block'
      }
    };
    this.setupSlidingContainer();
    SlideshowBase.apply(this, arguments);
  };

  Sliding.prototype = inheritMethods(SlideshowBase);

  Sliding.prototype.transition = function (nextSlideIndex) {
    var duration = this.options.slideTime;
    var newPos = nextSlideIndex * this.width;
    this.$el.animate({left: '-' + newPos + 'px'}, duration);
    this.currentSlide = nextSlideIndex;
  };

  Sliding.prototype.setupSlidingContainer = function () {
    var $container = $('<div class="slideshow-container">');
    this.$el.children().appendTo($container);
    this.$el.css('overflow', 'hidden');
    this.$el.prepend($container);
    this.$el = $container;
  };




  /* JQUERY PLUGIN */
  $.fn.slideshow = function (type, selector, options) {
    var SlideshowType;
    switch(type) {
      case 'fade': 
        SlideshowType = Fading;
        break;
      case 'slide': 
        SlideshowType = Sliding;
        break;
    }
    new SlideshowType(this, $(selector), options);
  };
})(jQuery);