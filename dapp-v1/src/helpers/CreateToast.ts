type toastVariant = "success" | "error" | "loading";

export function createToast(title: string, content: string, variant: toastVariant): void {
	// Set toast context and icon based on variant
	let toastContext = "success";
	let toastIcon = "fa-check-circle";
	if (variant == "error") {
		toastContext = "danger";
		toastIcon = "fa-fire";
	}
	else if (variant == "loading") {
		toastContext = "primary";
		toastIcon = "fa-spinner fa-spin";
	}

	// Create the toast element and set required attributes and styling
	const toastElem = document.createElement("div");
	toastElem.classList.add("toast");
	toastElem.setAttribute("role", "alert");
	toastElem.setAttribute("aria-live", "assertive");
	toastElem.setAttribute("aria-atomic", "true");
	toastElem.style.width = "400px";
	toastElem.style.backgroundColor = "var(--bs-content-bg)";

	// Set the HTML content of the toast
	toastElem.innerHTML = `
		<div class="toast-body p-3">
			<div class="d-flex align-items-center">
				<div
					class="
						d-flex align-items-center justify-content-center 
						rounded text-${toastContext}-emphasis bg-${toastContext}-subtle fs-5 
						flex-shrink-0 align-self-start
					"
					style="width: 36px; height: 36px;"
				>
					<i class="fa-solid ${toastIcon}"></i>
				</div>
				<div class="mx-3">
					<div class="h5 mb-1">${title}</div>
					<p class="text-body-secondary mb-0" style="font-size: 12px;">
						${content}
					</p>
				</div>
				<button
					type="button"
					class="btn-close ms-auto"
					data-bs-dismiss="toast"
					aria-label="Close"
				></button>
			</div>
		</div>
		<div
			class="bg-${toastContext} w-100 mt-1 rounded-bottom"
			style="height: 10px;"
		></div>
	`;

	// Toast the element
	document.getElementById("toast-container")?.appendChild(toastElem);
	bootstrap.Toast.getOrCreateInstance(toastElem).show();
}
