export function toast(opts: any): void {
  // Set the variables from options
  let title = "title" in opts ? opts.title : "";
  let content = "content" in opts ? opts.content : "";
  let alertType = "alertType" in opts ? opts.alertType : "";
  let fillType = "fillType" in opts ? opts.fillType : "";
  let dismissible = "dismissible" in opts ? opts.dismissible : true;
  let timer = "timer" in opts ? opts.timer : 5000;

  // Create the toast element
  const toast = document.createElement("div");

  // Set the required attributes and classes
  // Random Id is created an set
  toast.setAttribute("id", (Math.random() + 1).toString(36).substring(7));

  toast.classList.add("alert");
  if (alertType) toast.classList.add(alertType);
  if (fillType) toast.classList.add(fillType);

  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");
  toast.setAttribute("data-hm-timer", timer);

  // Set the content inside the toast
  if (title) {
    content = "<h4 class='alert-heading'>" + title + "</h4>" + content;
  }
  if (dismissible !== "false") {
    content =
      "<button class='close' type='button' data-hm-dismiss='alert' aria-label='Close'>&times;</button>" +
      content;
  }
  toast.innerHTML = content;

  // Insert the toast
  const stickyAlerts = document.getElementsByClassName("sticky-alerts")[0];
  stickyAlerts.insertBefore(toast, stickyAlerts.childNodes[0]);

  // Change alert display and start animation
  // The tiny timeout is needed for the transition to work
  toast.classList.add("set-d-block");
  setTimeout(function () {
    toast.classList.add("show");
  }, 50);

  // Wait for the timer to hit 0 before closing
  if (timer !== "false") {
    setTimeout(function () {
      // Start fade out and dismiss after animation
      toast.classList.add("fade-out");
      setTimeout(function () {
        toast.classList.add("set-d-none");
        toast.classList.remove("set-d-block");
        toast.classList.remove("show");
        toast.classList.remove("fade-out");
      }, 250);
    }, Number(timer));
  }
}
