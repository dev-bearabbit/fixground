(function () {
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var body = document.body;

  function handleHeaderState() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  }

  var scrollTimer = null;
  function handleBodyScrollClass() {
    if (prefersReduced) {
      return;
    }
    body.classList.add('is-scrolling');
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(function () {
      body.classList.remove('is-scrolling');
    }, 180);
  }

  window.addEventListener('scroll', function () {
    handleHeaderState();
    handleBodyScrollClass();
  }, { passive: true });
  handleHeaderState();

  var yearNode = document.querySelector('[data-year]');
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var input = document.createElement('input');
      input.value = text;
      input.setAttribute('readonly', '');
      input.style.position = 'absolute';
      input.style.left = '-9999px';
      document.body.appendChild(input);
      input.select();

      var success = false;
      try {
        success = document.execCommand('copy');
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(input);
      }

      if (success) {
        resolve();
      } else {
        reject(new Error('copy_failed'));
      }
    });
  }

  var copyButtons = document.querySelectorAll('[data-copy-email]');
  copyButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var email = button.getAttribute('data-copy-email');
      var defaultLabel = button.getAttribute('data-copy-default') || button.textContent || 'Copy Email';
      var successLabel = button.getAttribute('data-copy-success') || 'Copied';

      copyText(email).then(function () {
        button.textContent = successLabel;
        window.setTimeout(function () {
          button.textContent = defaultLabel;
        }, 1400);
      }).catch(function () {
        button.textContent = defaultLabel;
      });
    });
  });

  var topLink = document.querySelector('[data-scroll-top]');
  if (topLink) {
    topLink.addEventListener('click', function (event) {
      if (topLink.getAttribute('href') === '#top') {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
      }
    });
  }

  var heroItems = document.querySelectorAll('.hero-seq');
  heroItems.forEach(function (item, index) {
    var delay = prefersReduced ? 0 : 120 * index;
    window.setTimeout(function () {
      item.classList.add('is-visible');
    }, delay + 60);
  });

  var revealGroups = document.querySelectorAll('[data-reveal-group]');
  if (!revealGroups.length || !('IntersectionObserver' in window) || prefersReduced) {
    revealGroups.forEach(function (group) {
      group.querySelectorAll('.reveal, .stagger-item').forEach(function (item) {
        item.classList.add('is-visible');
      });
    });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return;
        }

        var group = entry.target;
        var reveals = group.querySelectorAll('.reveal');
        reveals.forEach(function (node) {
          node.classList.add('is-visible');
        });

        var staggerItems = group.querySelectorAll('.stagger-item');
        staggerItems.forEach(function (node, index) {
          window.setTimeout(function () {
            node.classList.add('is-visible');
          }, 90 * index);
        });

        observer.unobserve(group);
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealGroups.forEach(function (group) {
    observer.observe(group);
  });
})();
