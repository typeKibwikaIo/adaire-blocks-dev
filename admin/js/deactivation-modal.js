(function ($) {
	"use strict";

	var pluginDeactivationUrl = "";

	var followUpPrompts = {
		found_better:  "Which plugin did you switch to?",
		not_working:   "What wasn’t working? (Any details help us fix it)",
		missing_feature: "Which feature would have made the difference?",
		too_complex:   "What felt confusing or hard to use?",
		other:         "Anything else you’d like us to know?",
	};

	function getModal() {
		return $("#adaire-deactivation-modal");
	}

	function resetForm() {
		var $modal = getModal();
		$modal.find(".adaire-modal-success").hide();
		$modal.find(".adaire-modal-form-area").show();
		$modal.find('input[name="adaire_reason"]').prop("checked", false);
		$modal.find(".adaire-reasons-list label").removeClass("is-selected");
		$modal.find("#adaire-deactivation-email").val(adaireDeactivation.adminEmail || "");
		$modal.find("#adaire-deactivation-details").val("").attr("placeholder", "");
		$modal.find(".adaire-followup").hide();
		$modal.find(".adaire-submit-btn").prop("disabled", false).text("Submit & Deactivate");
	}

	function showModal() {
		var $modal = getModal();
		if (!$modal.length) return;
		resetForm();
		$modal.fadeIn(150);
	}

	function closeModal(andDeactivate) {
		getModal().fadeOut(150, function () {
			if (andDeactivate && pluginDeactivationUrl) {
				window.location.href = pluginDeactivationUrl;
			}
			pluginDeactivationUrl = "";
		});
	}

	// Intercept the deactivate link
	$(document).on("click", 'a[href*="adaire"][href*="action=deactivate"]', function (e) {
		if (pluginDeactivationUrl) return;
		e.preventDefault();
		pluginDeactivationUrl = $(this).attr("href");
		showModal();
	});

	// Close button
	$(document).on("click", ".adaire-modal-close", function () {
		closeModal(false);
	});

	// Click on backdrop
	$(document).on("click", "#adaire-deactivation-modal", function (e) {
		if ($(e.target).is(".adaire-modal-overlay")) {
			closeModal(false);
		}
	});

	// Reason selection — show/hide contextual follow-up
	$(document).on("change", 'input[name="adaire_reason"]', function () {
		var val = $(this).val();
		var $followup = $(".adaire-followup");
		var prompt = followUpPrompts[val];

		$(".adaire-reasons-list label").removeClass("is-selected");
		$(this).closest("label").addClass("is-selected");

		if (prompt) {
			$followup.find("textarea").attr("placeholder", prompt);
			$followup.slideDown(160);
		} else {
			$followup.slideUp(160);
		}
	});

	// Skip — deactivate without submitting
	$(document).on("click", ".adaire-skip-btn", function () {
		closeModal(true);
	});

	// Submit
	$(document).on("submit", "#adaire-deactivation-form", function (e) {
		e.preventDefault();

		var $btn = $(".adaire-submit-btn");
		$btn.prop("disabled", true).text("Sending…");

		$.post(adaireDeactivation.ajaxUrl, {
			action:   "adaire_deactivation_feedback",
			nonce:    adaireDeactivation.nonce,
			reason:   $('input[name="adaire_reason"]:checked').val() || "none",
			email:    $("#adaire-deactivation-email").val(),
			details:  $("#adaire-deactivation-details").val(),
		}).always(function () {
			// Show brief thank-you, then deactivate
			$(".adaire-modal-form-area").fadeOut(120, function () {
				$(".adaire-modal-success").fadeIn(200);
				setTimeout(function () {
					closeModal(true);
				}, 1400);
			});
		});
	});

})(jQuery);
