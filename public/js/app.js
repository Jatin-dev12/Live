(function ($) {
  'use strict';

  // sidebar submenu collapsible js
  $(".sidebar-menu .dropdown").on("click", function(){
    var item = $(this);
    item.siblings(".dropdown").children(".sidebar-submenu").slideUp();

    item.siblings(".dropdown").removeClass("dropdown-open");

    item.siblings(".dropdown").removeClass("open");

    item.children(".sidebar-submenu").slideToggle();

    item.toggleClass("dropdown-open");
  });

  $(".sidebar-toggle").on("click", function(){
    $(this).toggleClass("active");
    $(".sidebar").toggleClass("active");
    $(".dashboard-main").toggleClass("active");
  });

  $(".sidebar-mobile-toggle").on("click", function(){
    $(".sidebar").addClass("sidebar-open");
    $("body").addClass("overlay-active");
  });

  $(".sidebar-close-btn").on("click", function(){
    $(".sidebar").removeClass("sidebar-open");
    $("body").removeClass("overlay-active");
  });

  //to keep the current page active
  /* $(function () {
    for (
      var nk = window.location,
        o = $("ul#sidebar-menu a")
          .filter(function () {
            return this.href == nk;
          })
          .addClass("active-page") // anchor
          .parent()
          .addClass("active-page");
      ;

    ) {
      // li
      if (!o.is("li")) break;
      o = o.parent().addClass("show").parent().addClass("open");
    }
  }); */
  $(function () {
    var currentUrl = window.location.pathname;
    var currentFullUrl = window.location.href;
    
    // Remove any existing active classes
    $("ul#sidebar-menu li").removeClass("active-pagee");
    $("ul#sidebar-menu a").removeClass("active-page");
    
    // Special case: CMS edit content management should activate Page Master
    if (currentUrl.startsWith('/cms/edit-content-management/')) {
      $("ul#sidebar-menu a").filter(function () {
        return this.pathname && this.pathname.startsWith('/page-master');
      }).addClass("active-page").parent().addClass("active-pagee");
      return;
    }
    
    // First try exact URL match
    var exactMatch = $("ul#sidebar-menu a").filter(function () {
      return this.href === currentFullUrl || this.pathname === currentUrl;
    });
    
    if (exactMatch.length > 0) {
      exactMatch.addClass("active-page").parent().addClass("active-pagee");
      return;
    }
    
    // If no exact match, try path-based matching for modules
    var pathMatches = {
      '/index': '/index',
      '/roles': '/roles',
      '/page-master': '/page-master',
      '/cms': '/cms',
      '/menu-management': '/menu-management',
      '/media': '/media',
      '/seo': '/seo',
      '/ads': '/ads',
      '/leads': '/leads',
      '/url-redirect': '/url-redirect',
      '/settings': '/settings'
    };
    
    // Check if current path starts with any module path
    for (var modulePath in pathMatches) {
      if (currentUrl.startsWith(modulePath)) {
        var matchedAnchor = $("ul#sidebar-menu a").filter(function () {
          return this.pathname && this.pathname.startsWith(modulePath);
        });
        matchedAnchor.addClass("active-page").parent().addClass("active-pagee");
        break;
      }
    }
    
    // Special handling for root/dashboard
    if (currentUrl === '/' || currentUrl === '/index' || currentUrl.startsWith('/index')) {
      $("ul#sidebar-menu a[href='/index']").addClass("active-page").parent().addClass("active-pagee");
    }
  });

/**
* Utility function to calculate the current theme setting based on localStorage.
*/
function calculateSettingAsThemeString({ localStorageTheme }) {
  if (localStorageTheme !== null) {
    return localStorageTheme;
  }
  return "light"; // default to light theme if nothing is stored
}

/**
* Utility function to update the button text and aria-label.
*/
function updateButton({ buttonEl, isDark }) {
  const newCta = isDark ? "dark" : "light";
  buttonEl.setAttribute("aria-label", newCta);
  buttonEl.innerText = newCta;
}

/**
* Utility function to update the theme setting on the html tag.
*/
function updateThemeOnHtmlEl({ theme }) {
  document.querySelector("html").setAttribute("data-theme", theme);
}

/**
* 1. Grab what we need from the DOM and system settings on page load.
*/
const button = document.querySelector("[data-theme-toggle]");
const localStorageTheme = localStorage.getItem("theme");

/**
* 2. Work out the current site settings.
*/
let currentThemeSetting = calculateSettingAsThemeString({ localStorageTheme });

/**
* 3. If the button exists, update the theme setting and button text according to current settings.
*/
if (button) {
  updateButton({ buttonEl: button, isDark: currentThemeSetting === "dark" });
  updateThemeOnHtmlEl({ theme: currentThemeSetting });

  /**
  * 4. Add an event listener to toggle the theme.
  */
  button.addEventListener("click", (event) => {
    const newTheme = currentThemeSetting === "dark" ? "light" : "dark";

    localStorage.setItem("theme", newTheme);
    updateButton({ buttonEl: button, isDark: newTheme === "dark" });
    updateThemeOnHtmlEl({ theme: newTheme });

    currentThemeSetting = newTheme;
  });
} else {
  // If no button is found, just apply the current theme to the page
  updateThemeOnHtmlEl({ theme: currentThemeSetting });
}


// =========================== Table Header Checkbox checked all js Start ================================
$('#selectAll').on('change', function () {
  $('.form-check .form-check-input').prop('checked', $(this).prop('checked')); 
}); 

  // Remove Table Tr when click on remove btn start
  $('.remove-btn').on('click', function () {
    $(this).closest('tr').remove(); 

    // Check if the table has no rows left
    if ($('.table tbody tr').length === 0) {
      $('.table').addClass('bg-danger');

      // Show notification
      $('.no-items-found').show();
    }
  });
  // Remove Table Tr when click on remove btn end
})(jQuery);