export function resetSidebar(): void {
  const pageWrapper = document.getElementsByClassName("page-wrapper")[0];

  // Reset attribute
  pageWrapper.removeAttribute("data-hm-sidebar-hidden");

  // Reset body scrolling (x-axis after transition completes)
  setTimeout(function () {
    document.body.classList.remove("sidebar-open-adjust-x");
  }, 2000);
  document.body.classList.remove("sidebar-open-adjust-y");
  document.body.classList.remove("sidebar-overlayed-all");
}

export function closeSidebar(): void {
  const pageWrapper = document.getElementsByClassName("page-wrapper")[0];

  if (window.innerWidth > 768) {
    pageWrapper.setAttribute("data-hm-sidebar-hidden", "true");

    // Reset body scrolling (x-axis after transition completes)
    setTimeout(function () {
      document.body.classList.remove("sidebar-open-adjust-x");
    }, 2000);
    document.body.classList.remove("sidebar-open-adjust-y");
    document.body.classList.remove("sidebar-overlayed-all");
  } else {
    resetSidebar();
  }
}

export function openSidebar(): void {
  const pageWrapper = document.getElementsByClassName("page-wrapper")[0];
  const sidebar = document.getElementsByClassName("sidebar")[0];
  const sidebarType = sidebar.getAttribute("data-hm-sidebar-type");

  if (window.innerWidth > 768) {
    if (sidebarType?.includes("overlayed-all")) {
      pageWrapper.setAttribute("data-hm-sidebar-hidden", "false");

      // Adjust body scrolling
      document.body.classList.add("sidebar-open-adjust-x");
      document.body.classList.add("sidebar-open-adjust-y");
      document.body.classList.add("sidebar-overlayed-all");
    } else {
      resetSidebar();
    }
  } else {
    pageWrapper.setAttribute("data-hm-sidebar-hidden", "false");

    // Adjust body scrolling
    document.body.classList.add("sidebar-open-adjust-x");
    document.body.classList.add("sidebar-open-adjust-y");
    if (sidebarType?.includes("overlayed-all")) {
      document.body.classList.add("sidebar-overlayed-all");
    }
  }
}

export function toggleSidebar(): void {
  const pageWrapper = document.getElementsByClassName("page-wrapper")[0];
  const sidebar = document.getElementsByClassName("sidebar")[0];
  const sidebarType = sidebar.getAttribute("data-hm-sidebar-type");

  // If the page wrapper has the "data-hm-sidebar-hidden" attribute,
  // its value is flipped
  if (pageWrapper.hasAttribute("data-hm-sidebar-hidden")) {
    var sidebarHidden = pageWrapper.getAttribute("data-hm-sidebar-hidden");
    if (sidebarHidden === "true") {
      openSidebar();
    } else if (sidebarHidden === "false") {
      closeSidebar();
    }
  }
  // Otherwise, the sidebar is toggled depending on the screen width
  // and the type of the sidebar used
  else {
    if (window.innerWidth > 768) {
      if (sidebarType?.includes("overlayed-all")) {
        openSidebar();
      } else {
        closeSidebar();
      }
    } else {
      openSidebar();
    }
  }
}
