/**
 * @file
 * A JavaScript file for the main menu section.
 */

(function (Drupal, $, once) {
  'use strict';
    Drupal.behaviors.jewelers_mutual_menu = {
      attach: function (context, settings) {      
        function hideMobilePrimarySubmenus() {
          $("[id^='primary-submenu-']").not('.desktop-main-nav-sub').hide();
        }
        function anyPrimarySubmenuVisible() {
          return $("[id^='primary-submenu-']").filter(function() {
            return $(this).is(':visible') && !$(this).hasClass('desktop-main-nav-sub');
          }).length > 0;
        }

        function updateScrollForPrimarySubmenu() {
          if (anyPrimarySubmenuVisible()) {
            disableScroll();
          } else if (!document.body.classList.contains('nav-tray-open')) {
            enableScroll();
          }
        }
        function closeTrayOnPageShowOrLoad() {
          document.body.classList.remove('nav-tray-open');
          var mobileNavMain = document.getElementById('mobileNavMain');
          var mainNavWrapper = document.getElementById('mobileNavMainWrapper');
          if (mobileNavMain) mobileNavMain.style.left = "-100%";
          if (mainNavWrapper) mainNavWrapper.style.width = "0";
          enableScroll();
        }
        window.addEventListener('load', closeTrayOnPageShowOrLoad);
        window.addEventListener('pageshow', closeTrayOnPageShowOrLoad);
        
        const nonPassiveOptions = { passive: false };
        function disableScroll() {
          document.body.style.overflow = 'hidden';
          document.body.addEventListener('wheel', preventScroll, nonPassiveOptions);
          document.body.addEventListener('touchmove', preventScroll, nonPassiveOptions);
          document.body.addEventListener('keydown', preventKeyScroll, true);
        }
        function enableScroll() {
          document.body.style.overflow = '';
          document.body.removeEventListener('wheel', preventScroll, nonPassiveOptions);
          document.body.removeEventListener('touchmove', preventScroll, nonPassiveOptions);
          document.body.removeEventListener('keydown', preventKeyScroll, true);
        }
        function preventScroll(e) {
          e.preventDefault();
        }
        function preventKeyScroll(e) {
          // Prevent the use of arrow, space, page up/down, home/end for scrolling
          if ([32,33,34,35,36,37,38,39,40].includes(e.keyCode)) {
            e.preventDefault();
          }
        }
        // Debounce for updateScrollForPrimarySubmenu
        let updateScrollTimeout = null;
        function debouncedUpdateScrollForPrimarySubmenu() {
          if (updateScrollTimeout) {
            clearTimeout(updateScrollTimeout);
          }
          updateScrollTimeout = setTimeout(() => {
            updateScrollForPrimarySubmenu();
            updateScrollTimeout = null;
          }, 0);
        }
        // Close on esc key
        once('nav-tray-esc', document.body).forEach(() => {
          document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && document.body.classList.contains('nav-tray-open')) {
              const mobileNavMain = document.getElementById('mobileNavMain');
              const mainNavWrapper = document.getElementById('mobileNavMainWrapper');
              if (mobileNavMain && mainNavWrapper) {
                mobileNavMain.style.left = "-100%";
                mainNavWrapper.style.width = "0";
                document.body.classList.remove('nav-tray-open');
                enableScroll();
              }
            }
          });
        });
        /** todo: Need to convert these jquery codes to javascript. */
        $('.menu__item-li--expanded > span, .menu__item-li--expanded > a')
        .each(function(index) {
          $(this).attr({"id": "primary-menu-item-" + index, "aria-haspopup": "true", "aria-expanded": "false", "role": "button", "tabindex": "0", "aria-controls": "primary-submenu-" + index});
          $(this).siblings(".submenu, .desktop-main-nav-sub").attr("id", "primary-submenu-" + index)
          //$(this).parent().attr("aria-labelledby", "primary-menu-item-" + index);
          $(this).parent().addClass('isExpanded');
          $(this).addClass('isExpanded');
        });

        $(document).on('click', function(event) {
          if (!$(event.target).closest('.submenu, .main-nav-item').length) {
            $(this).find('.main-nav-item').removeClass('underline text-accent active text-accent!');
            $(this).find('.main-nav-item').addClass('text-ink-brand');
            // Only hide mobile submenus, not desktop
            $('.submenu').not('.desktop-main-nav-sub').hide();
            hideMobilePrimarySubmenus();
            debouncedUpdateScrollForPrimarySubmenu();
          }
          if (!$(event.target).parent().hasClass('menu__item-li--expanded')) {
            $('.menu__item-li--expanded', context).addClass('isExpanded');
            $('.menu__item-li--expanded', context).attr("aria-expanded", 'false');
            $('.menu__item-li--expanded', context).each(function() {
              $(this).children('span:first, a:first').addClass('isExpanded');
              $(this).children('span:first, a:first').attr("aria-expanded", 'false');
            });
            hideMobilePrimarySubmenus();
            debouncedUpdateScrollForPrimarySubmenu();
          }
          if (!$(event.target).parent().hasClass('menu__item-li--expanded')) {
            $(this).find('.menu__item-li--expanded').removeClass('active');
            hideMobilePrimarySubmenus();
            debouncedUpdateScrollForPrimarySubmenu();
          }
        });

        $('.menu__item-li--expanded', context).each(function(index) {
          $(this).click(function() {
            $(this).siblings().find('.main-nav-item').removeClass('underline text-accent!');
            $(this).siblings().find('.main-nav-item').addClass('text-ink-brand');
            $(this).find('.main-nav-item').toggleClass('underline text-ink-brand text-accent!');
            $('.menu__item-li--expanded', context).find('.submenu').hide();
            $(this).find('.submenu').toggle();
            $(this).siblings().addClass('isExpanded');
            $('.menu__item-li--expanded', context).attr("aria-expanded", 'false');
            $('.menu__item-li--expanded', context).each(function() {
              $(this).children('span:first, a:first').addClass('isExpanded');
              $(this).children('span:first, a:first').attr("aria-expanded", 'false');
            });
            let isExpanded = $(this).hasClass('isExpanded');
            $(this).attr('aria-expanded', isExpanded).toggleClass('isExpanded', !isExpanded);
            $(this).children('span:first, a:first').attr('aria-expanded', isExpanded).toggleClass('isExpanded', !isExpanded);
            if ($(this).parents('.region').hasClass('region-main-menu-sub-nav')) {
              $('.account-nav').find('.menu__item-li--expanded').removeClass('active');
              $('.account-nav').find('.menu__item-li--expanded').addClass('isExpanded');
              $('.account-nav').find('.menu__item-li--expanded').attr("aria-expanded", 'false');
              $('.account-nav').find('.menu__item-li--expanded').children('span:first, a:first').attr("aria-expanded", 'false');
              $('.account-nav').find('.menu__item-li--expanded').children('span:first, a:first').addClass('isExpanded');
            }
            if (!$(this).parents('.region').hasClass('region-main-menu-sub-nav')) {
              $('.region-main-menu-sub-nav .menu__item-li--expanded', context).addClass('isExpanded');
            }
            // After toggling, update scroll state for primary-submenu
            debouncedUpdateScrollForPrimarySubmenu();
          }).on("keyup", function(event) {
            // Check if the Enter key was pressed (keyCode 13)
            if (event.keyCode === 13) {
              $(this).siblings().find('.submenu').hide();
              $(this).find('.submenu').toggle();
              debouncedUpdateScrollForPrimarySubmenu();
            }
          });
        });

        once('header','.account-nav', context).forEach((el) => {
          $(el).find('.menu__item-li--expanded').on("touchstart", function(event) {
            $(el).find('.menu__item-li--expanded').removeClass('active');
            $(this).toggleClass('active');
          });
          $(el).find('.desktop-main-nav-sub').click(function (e) {
            e.stopPropagation();
          })
          $(el).find('.menu__item-li--expanded').on("click", function(event) {
            $(el).find('.menu__item-li--expanded').removeClass('active');
            $(this).toggleClass('active');
          });
          $(el).find(".menu__item-li").on("keyup", function(event) {
            // Check if the Enter key was pressed (keyCode 13)
            if (event.keyCode === 13) {
              $(el).find(".menu__item-li").removeClass('active');
              $(this).toggleClass('active');
            }
          });
        });
        $(document).on("keyup", function(event) {
          const childParent = event.target.parentNode.closest('.menu__item-li') ?
                event.target.parentNode.closest('.menu__item-li').classList.contains('menu__item-li--expanded') :
                '';

          if (!event.target.parentNode.classList.contains('menu__item-li--expanded') && !childParent) {
            $(this).find(".menu__item-li .submenu").hide();
          }
          if (!event.target.parentNode?.classList?.contains('menu__item-li--expanded') &&
              !event.target.parentNode?.parentNode?.parentNode?.classList?.contains('menu__item-li--expanded')) {
            $(this).find(".menu__item-li").removeClass('active');
          }
        });

        once('menu', '[data-component-id="jm_brand:menu"]', context).forEach((el) => {
          const linesOfBusiness = document.getElementById('block-jm-brand-linesofbusiness');
          if (linesOfBusiness) {
            let activeItem = linesOfBusiness.querySelector('[data-drupal-active-trail="true"]');
            if (activeItem) {
              document.querySelectorAll('[data-drupal-logo="main-nav"]').forEach(e => e.href = activeItem.href);
            }
          }
        });
        once('jewelers_mutual_menu', '.region-main-menu-sub-nav', context).forEach((el) => {
          const closeNav = document.getElementById('close-main-nav');
          const openNav = document.getElementById('open-main-nav');
          const mainNavWrapper = document.getElementById('mobileNavMainWrapper');
          const mobileNavMain = document.getElementById('mobileNavMain');
          const desktopMainNav = document.querySelector('[data-menu-type="main-nav"]');
          const desktopTerinaryMenu = document.querySelector('.account-nav');
          const mobileNavContent = document.getElementById('mobileNavContent');
          const mobileCta = document.querySelector('[data-block-type="mobile-nav-cta"]');
          const mobileNavCta = document.getElementById('mobileNavCta');

          // Call after menu is built/updated
          setTimeout(setRightmostDesktopMainNavSub, 0);

          el.querySelectorAll('.menu-level-1').forEach(ul => {
            let hasNestedUl = false;
            ul.querySelectorAll('.menu-level-2').forEach(() => {
              hasNestedUl = true;
            });

            if (!hasNestedUl) {
              ul.classList.add('notNested', 'flex-col');
              ul.classList.remove('gap-l', 'self-stretch');
            }
          });

          if (desktopMainNav) {
            const cloneNav = desktopMainNav.cloneNode(true);
            cloneNav.id = 'mobile-main-nav';
            mobileNavContent.appendChild(cloneNav);

            const mainNavTitle = document.getElementById('main-nav-title');
            const navBlockTitle = desktopMainNav.querySelector('h2.nav-title');
            if (navBlockTitle) {
              mainNavTitle.textContent = navBlockTitle.textContent;
            }
          }
          if (mobileCta) {
            mobileNavCta.appendChild(mobileCta.cloneNode(true));
          }
          if (desktopTerinaryMenu) {
            mobileNavContent.appendChild(desktopTerinaryMenu.cloneNode(true));
          }

          mobileNavCta.querySelectorAll('.mobile-nav-cta').forEach(e => {
            e.classList.remove('[#main-nav-wrapper_&]:group-[.dark-nav.fixed-header]:bg-transparent', '[#main-nav-wrapper_&]:group-[.dark-nav.fixed-header]:border-white', 'hidden', 'justify-end');
            e.classList.add('justify-center', 'flex!');
          });

          mobileNavContent.querySelectorAll('[data-component-id="jm_brand:menu"]').forEach((e) => {
            e.classList.add('flex', 'items-start', 'self-stretch', 'px-m', 'flex-col', 'justify-between');
            e.classList.remove('items-center', 'gap-m-l', 'hidden', 'md:flex');
            e.querySelectorAll('svg').forEach(e => e.classList.remove('hidden'));
            e.querySelectorAll('.desktop-main-nav-sub').forEach(el => el.remove());
            e.querySelectorAll('.submenu').forEach(el => el.remove());
          });

          mobileNavContent.querySelectorAll('.menu__item-li').forEach((e) => {
            e.classList.add('py-m', 'flex', 'justify-between', 'items-center', 'w-full', 'border-b', 'border-0', 'border-[#C7CFDF]', 'py-m');
            e.classList.remove('relative', 'py-xs');
            e.querySelector('a, span').classList.remove('group-[.dark-nav.fixed-header]:text-white', 'group-[.dark-nav]:text-white!', 'py-xs', 'text-step-00', 'fw-normal', 'text-brand', 'text-ink-brand', 'font-sans');
            e.querySelector('a, span').classList.add('text-ink', 'font-semibold');
            e.querySelectorAll('.mobile-main-nav-sub').forEach(el => el.classList.remove('hidden'));
            e.querySelectorAll('li').forEach(el => {
              el.querySelector('a, span').classList.remove('group-[.dark-nav.fixed-header]:text-white', 'group-[.dark-nav]:text-white!', 'font-semibold', 'main-nav-item', 'account-nav-item', 'py-xs', 'text-step-00', 'text-brand', 'text-ink-brand', 'font-sans');
            });
          });

          openNav.addEventListener('click', (e) => {
            mobileNavMain.style.left = "0";
            mainNavWrapper.style.width = "100%";
            document.body.classList.add('nav-tray-open');
            disableScroll();
          });

          closeNav.addEventListener('click', (e) => {
            mobileNavMain.style.left = "-100%";
            mainNavWrapper.style.width = "0";
            document.body.classList.remove('nav-tray-open');
            enableScroll();
          });

          mainNavWrapper.addEventListener('click', (e) => {
            mobileNavMain.style.left = "-100%";
            mainNavWrapper.style.width = "0";
            document.body.classList.remove('nav-tray-open');
            enableScroll();
          });
          mobileNavMain.addEventListener('click', (e) => {
           e.stopPropagation()
          });

          mobileNavContent.addEventListener('click', (e) => {
            if (e.target && e.target.matches('.menu__item-li')) {
              e.target.querySelector('.main-nav-arrow-right').classList.add('hidden');
              e.target.querySelector('.mobile-main-nav-sub').style.left = "0";
            }
            if (e.target && (e.target.matches('.main-nav-item') || e.target.matches('.account-nav-item'))) {
              const siblings = Array.from(e.target.parentNode.children).filter(child => child !== e.target);
              for (const sibling of siblings) {
                if (sibling.classList.contains('main-nav-arrow-right')) {
                  sibling.classList.add('hidden');
                }
                if (sibling.classList.contains('mobile-main-nav-sub')) {
                  sibling.style.left = "0";
                }
              }
            }
            if (e.target && e.target.matches('.main-nav-arrow-right')) {
              e.target.classList.add('hidden');
              const siblings = Array.from(e.target.parentNode.children).filter(child => child !== e.target);
              for (const sibling of siblings) {
                if (sibling.classList.contains('main-nav-arrow-left')) {
                  sibling.classList.remove('hidden');
                }
              }
              e.target.nextElementSibling.style.left = "0";
            }
            if (e.target && e.target.matches('.main-nav-arrow-right-path')) {
              e.target.parentNode.classList.add('hidden');
              const siblings = Array.from(e.target.parentNode.parentNode.children).filter(child => child !== e.target);
              for (const sibling of siblings) {
                if (sibling.classList.contains('main-nav-arrow-left')) {
                  sibling.classList.remove('hidden');
                }
              }
              e.target.parentNode.nextElementSibling.style.left = "0";
            }

            if (e.target && e.target.matches('.mobile-parent-navItem')) {
              const siblings = Array.from(e.target.parentNode.parentNode.parentNode.children).filter(child => child !== e.target);
              for (const sibling of siblings) {
                if (sibling.classList.contains('main-nav-arrow-right')) {
                  sibling.classList.remove('hidden');
                }
               if(sibling.classList.contains('mobile-main-nav-sub')) {
                  sibling.style.left = "-100%";
                }
              }
            }
            if (e.target && e.target.matches('.main-nav-arrow-left')) {
              const siblings = Array.from(e.target.parentNode.parentNode.parentNode.children).filter(child => child !== e.target);
              for (const sibling of siblings) {
                if (sibling.classList.contains('main-nav-arrow-right')) {
                  sibling.classList.remove('hidden');
                }
               if(sibling.classList.contains('mobile-main-nav-sub')) {
                  sibling.style.left = "-100%";
                }
              }
            }
            if (e.target && e.target.matches('.main-nav-arrow-left-path')) {
              const siblings = Array.from(e.target.parentNode.parentNode.parentNode.children).filter(child => child !== e.target);
              for (const sibling of siblings) {
                if (sibling.classList.contains('main-nav-arrow-right')) {
                  sibling.classList.remove('hidden');
                }
                if (sibling.classList.contains('mobile-main-nav-sub')) {
                  sibling.style.left = "-100%";
                }
              }
            }
          });
          el.querySelectorAll('#mobileNavContent .mobile-submenu-wrapper li').forEach((e) => {
            let nextSibling = e.firstElementChild.nextElementSibling;
            if (nextSibling && nextSibling.tagName === 'UL') {
              e.firstElementChild.classList.add('font-semibold!');
            }
          });

          // Toggle dark/light Main Nav on window scroll
          const fixedHeader = document.querySelector('body.fixed-header');
          const navbar = document.querySelector('header');
          const mainNavLogo = navbar.querySelector('.main-nav-logo');
          const mainNavLogoWhite = navbar.querySelector('.main-nav-logo-white');
          const emergencyAlert = document.getElementById('emergency-alert');
          let hasScrolled = false;

          if (emergencyAlert) {
            // Remove the transparent class if there is an emergency alert.
            navbar.classList.remove('group-[.dark-nav.fixed-header]:bg-transparent');
          }

          window.addEventListener('scroll', () => {
            if (window.scrollY > 50 && !hasScrolled) {
              navbar.classList.remove('group-[.dark-nav.fixed-header]:bg-transparent');
              mainNavLogo ? mainNavLogo.classList.remove('group-[.dark-nav.fixed-header]:hidden') : '';
              mainNavLogoWhite ? mainNavLogoWhite.classList.remove('group-[.dark-nav.fixed-header]:flex') : '';
              navbar.querySelectorAll('.main-nav-item').forEach(e => e.classList.remove('group-[.dark-nav.fixed-header]:text-white'));
              navbar.querySelectorAll('[data-block-type="main-nav-cta"]').forEach(e => {
                e.querySelector('button.block').classList.remove('[#main-nav-wrapper_&]:group-[.dark-nav.fixed-header]:bg-transparent', '[#main-nav-wrapper_&]:group-[.dark-nav.fixed-header]:border-white', 'group-has-[.hero-banner_.cta-btns]:hidden');
              });
              document.getElementById('open-main-nav').querySelector('path').classList.remove('group-[.dark-nav.fixed-header]:fill-white');
              if (fixedHeader) {
                navbar.classList.add('fixed!');
              }
              hasScrolled = true;
            }
            else if (window.scrollY <= 50 && hasScrolled) {
              navbar.classList.add('group-[.dark-nav.fixed-header]:bg-transparent');
              mainNavLogo ? mainNavLogo.classList.add('group-[.dark-nav.fixed-header]:hidden') : '';
              mainNavLogoWhite ? mainNavLogoWhite.classList.add('group-[.dark-nav.fixed-header]:flex') : '';
              navbar.querySelectorAll('.main-nav-item').forEach(e => e.classList.add('group-[.dark-nav.fixed-header]:text-white'));
              navbar.querySelectorAll('[data-block-type="main-nav-cta"]').forEach(e => {
                e.querySelector('button.block').classList.add('[#main-nav-wrapper_&]:group-[.dark-nav.fixed-header]:bg-transparent', '[#main-nav-wrapper_&]:group-[.dark-nav.fixed-header]:border-white', 'group-has-[.hero-banner_.cta-btns]:hidden');
              });
              document.getElementById('open-main-nav').querySelector('path').classList.add('group-[.dark-nav.fixed-header]:fill-white');
              if (fixedHeader) {
                navbar.classList.remove('fixed!');
              }
              hasScrolled = false;
            }
          });
        });

        window.addEventListener('load', () => {
          //cookie preferences in footer legal menu
          var cookie_consent = document.getElementById('teconsent');
          if (cookie_consent) {
            var consentlink = cookie_consent.firstElementChild;
            var legal_menu = document.getElementById('block-jm-brand-legalmenu');
            var legal_menu_links = legal_menu.getElementsByTagName('a');
            for (const linkclass of legal_menu_links[0].classList) {
              consentlink?.classList?.add(linkclass);
            }
            for (const a_link of legal_menu_links) {
              if (a_link.innerText == 'Cookie Preferences') {
                a_link.replaceWith(cookie_consent);
                break;
              }
            }
          }

          let intersectionObserver = new IntersectionObserver((entries) => { 
              entries.forEach(entry => {
                if(entry.isIntersecting) {
                    entry.target.classList.add("countingup-in-view");
                    entry.target.querySelectorAll(".countingup-num").forEach(card => {
                      var countervalues = card.getAttribute('data-counter');
                      var countermarkup = card.innerHTML;
                      var counterfrom = "80";
                      var counterto = "100";
                      if( countervalues.includes('-') ) {
                        var splitvalues = countervalues.split('-');
                        counterfrom = splitvalues['0'];
                        counterto = splitvalues['1'];
                      } else {
                        counterfrom = countervalues;
                        counterto = countermarkup.match(/(\d+\.?\d*)/g) ?? countermarkup.match(/(\d+\.?\d*)/g)['0']; 
                      }
                      card.setAttribute('data-counter',counterfrom + '-' + counterto);
                      card.innerHTML = counterto >= 0 ? countermarkup.replace(counterto,'') : countermarkup;
                      card.style.cssText = "--countingup-from : " + counterfrom + ";--countingup-to : " + counterto;
                    });
                } else {
                    entry.target.classList.remove("countingup-in-view");
                    entry.target.querySelectorAll(".countingup-num").forEach(card => {
                      var countermarkup = card.innerHTML;
                      var countervalues = card.getAttribute('data-counter');
                      var counterto = '100';
                      if( countervalues.includes('-') ) {
                        counterto = countervalues.split('-')['1'];
                      } else {
                        counterto = countermarkup.match(/(\d+\.?\d*)/g) ?? countermarkup.match(/(\d+\.?\d*)/g)['0']; 
                      }
                      countermarkup = counterto >= 0 ? countermarkup.replace(counterto,'') : countermarkup;
                      card.innerHTML = counterto + countermarkup;
                    });
                  }
                });
          }, {
              threshold: 1
          });
          document.querySelectorAll(".countingup-section").forEach(counterup_section => {
            intersectionObserver.observe(counterup_section);
          });
        });
        // This adds a special class to the rightmost ul in the top menu.
        function setRightmostDesktopMainNavSub() {
          const subs = Array.from(document.querySelectorAll('.desktop-main-nav-sub[data-menu-index]'));
          let maxIndex = -1;
          let rightmost = null;
          subs.forEach(function(sub) {
            sub.classList.remove('desktop-main-nav-sub--rightmost');
            const idx = parseInt(sub.getAttribute('data-menu-index'), 10);
            if (!isNaN(idx) && idx > maxIndex) {
              maxIndex = idx;
              rightmost = sub;
            }
          });
          if (rightmost) {
            rightmost.classList.add('desktop-main-nav-sub--rightmost');
          }
        }
      }
    };
  })(Drupal, jQuery, once);
