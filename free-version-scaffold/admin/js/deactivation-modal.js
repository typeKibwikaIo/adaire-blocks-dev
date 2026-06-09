(function ($) {
	"use strict";

	var pluginDeactivationUrl = "";

	// Step 1: find the modal element.
	function getModal() {
		return $("#adaire-deactivation-modal");
	}

	// Step 1: reset the form fields for a fresh submit.
	function resetForm() {
		var $modal = getModal();
		$modal.find('input[name="adaire_reason"]').prop("checked", false);
		$modal.find("#adaire-deactivation-email, #adaire-deactivation-details").val("");
		$("#adaire-other-details").hide();
		$modal.find(".adaire-submit-btn").prop("disabled", false).text("Submit & Deactivate");
	}

	// Step 1: show the modal.
	function showModal() {
		var $modal = getModal();
		if (!$modal.length) return;
		resetForm();
		$modal.fadeIn(150);
	}

	// Step 1: hide the modal.
	function closeModal() {
		getModal().fadeOut(150);
	}

	// Step 3: continue with the actual plugin deactivation.
	function proceedWithDeactivation() {
		if (pluginDeactivationUrl) {
			window.location.href = pluginDeactivationUrl;
		}
	}

	$(document).on(
		"click",
		'a[href*="adaire"][href*="action=deactivate"]',
		function (event) {
			if (pluginDeactivationUrl) return;
			event.preventDefault();
			pluginDeactivationUrl = $(this).attr("href");
			showModal();
		}
	);

	$(document).on("change", 'input[name="adaire_reason"]', function () {
		$("#adaire-other-details").toggle($(this).val() === "other");
	});

	$(document).on("click", ".adaire-skip-btn", function () {
		closeModal();
		proceedWithDeactivation();
	});

	$(document).on("click", "#adaire-deactivation-modal", function (event) {
		if ($(event.target).hasClass("adaire-modal-overlay")) {
			closeModal();
			pluginDeactivationUrl = "";
		}
	});

	$(document).on("submit", "#adaire-deactivation-form", function (event) {
		event.preventDefault();

		var $submitButton = $(".adaire-submit-btn");
		$submitButton.prop("disabled", true).text("Sending…");

		$.post(adaireDeactivation.ajaxUrl, {
			action: "adaire_deactivation_feedback",
			nonce: adaireDeactivation.nonce,
			reason: $('input[name="adaire_reason"]:checked').val() || "none",
			email: $("#adaire-deactivation-email").val(),
			details: $("#adaire-deactivation-details").val(),
		}).always(proceedWithDeactivation);
	});
})(jQuery);
