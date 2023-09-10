var html = document.documentElement;
var body = document.body;
var timeout;
var st = 0;

cover();
featured();
pagination(false);

window.addEventListener('scroll', function () {
    'use strict';
    if (body.classList.contains('home-template') && body.classList.contains('with-full-cover') && !document.querySelector('.cover').classList.contains('half')) {
        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }
        timeout = window.requestAnimationFrame(portalButton);
    }
});

if (document.querySelector('.cover') && document.querySelector('.cover').classList.contains('half')) {
    body.classList.add('portal-visible');
}

function portalButton() {
    'use strict';
    st = window.scrollY;

    if (st > 300) {
        body.classList.add('portal-visible');
    } else {
        body.classList.remove('portal-visible');
    }
}

function cover() {
  'use strict';
  var cover = document.querySelector('.cover');
  if (!cover) {
    return;
  }

  imagesLoaded(cover, function () {
    cover.classList.remove('image-loading');
  });

  let coverArrow = document.querySelector('.cover-arrow');
  if (coverArrow) {
    coverArrow.addEventListener('click', function () {
      var element = cover.nextElementSibling;
      element.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  }

  let coverForm = document.getElementById('cover-form');
  if (coverForm) {
    coverForm.addEventListener('submit', (e) => {
      e.preventDefault();
      e.stopPropagation();
      coverForm.classList.add('loading');
      let f = (user) => {
        MomentCRM('off', 'userUpdate', f);
        coverForm.classList.add('success');
        coverForm.classList.remove('loading');
      };
      MomentCRM('on', 'userUpdate', f);
      MomentCRM('update', {
        email: coverForm.getElementsByClassName('auth-email')[0].value,
        document.activeElement.blur();
      });
    });
  }
}

function featured() {
    'use strict';
    var feed = document.querySelector('.featured-feed');
    if (!feed) return;

    tns({
        container: feed,
        controlsText: [
            '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.547 22.107L14.44 16l6.107-6.12L18.667 8l-8 8 8 8 1.88-1.893z"></path></svg>',
            '<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M11.453 22.107L17.56 16l-6.107-6.12L13.333 8l8 8-8 8-1.88-1.893z"></path></svg>',
        ],
        gutter: 30,
        loop: false,
        nav: false,
        responsive: {
            0: {
                items: 1,
            },
            768: {
                items: 2,
            },
            992: {
                items: 3,
            },
        },
    });
}

