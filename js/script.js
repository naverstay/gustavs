var body_var,
  notifier,
  next_note = '',
  price_section,
  checkout_form,
  forced = false,
  paused = false,
  box,
  tween,
  header,
  wnd,
  Reviews,
  reviewSlider,
  reviewSlider2,
  total_price = 0,
  work_price = 0,
  material_price = 0,
  material_share = 0,
  notification_timer = 30000,
  global_window_Height,
  checkout_popup,
  inputMaskEvents = {
    "oncomplete": function (ev) {
      // console.log(ev, this);
      $(this).addClass('_complete').removeClass('_incomplete');

    },
    "onincomplete": function (ev) {
      // console.log(ev, this);
      $(this).addClass('_incomplete').removeClass('_complete');
    },
    "oncleared": function (ev) {
      // console.log(ev, this);
      $(this).removeClass('_complete');
    }
  };

$(function ($) {

  wnd = $(window);
  body_var = $('body');
  price_section = $('.priceSection');
  checkout_form = $('.checkoutForm');
  header = $('.header');
  notifier = $('<div class="notify_holder"/>');

  body_var
    .delegate('.popupClose', 'click', function () {
      $(this).closest('.ui-dialog-content').dialog('close');
      return false;
    })
    .delegate('.sliderHolder .review_item', 'mouseenter', function () {

      tween.pause();

    })
    .delegate('.sliderHolder .review_item', 'mouseleave', function () {

      tween.resume();

    })
    .delegate('.rmTaskBtn', 'click', function () {
      var btn = $(this);

      $('.addTaskBtn').filter(function () {
        return $(this).attr('href') == btn.attr('href');
      }).click();

      return false;
    })
    .delegate('.addTaskRow', 'click', function () {
      $(this).find('.addTaskBtn').click();

      return false;
    })
    .delegate('.addTaskBtn', 'click', function () {
      var btn = $(this), target = $(btn.attr('href')), id = btn.attr('href').replace('#', ''), row = btn.closest('.price_row');

      $('.tab_link[href="#price_tab_1"]').click();

      if (target.length) {
        target.removeClass('_active').addClass('_removed');

        $('#estimations').closest('.mCSB').mCustomScrollbar("scrollTo", target, {scrollInertia: 1000});

        setTimeout(function () {
          row.removeClass('_active');
          btn.removeClass('_active');
        }, 500);

        setTimeout(function () {
          target.remove();

          if (!$('#estimations').children().length) {
            $('#price_tab_1').addClass('show_example');
          }

        }, 1000);

      } else {
        work_price = 0;
        material_price = 0;
        material_share = 0;

        $('#price_tab_1').removeClass('show_example');

        var clone = row.clone();

        row.addClass('_active');

        btn.addClass('_active');

        $('.taskName').text(row.find('.task_name').text());

        updateEstimation(target.attr('data-estimate'), function (data) {

          var est_block = '<div class="task_estimation _active animated" id="' + id + '" data-estimate="' + id + '"><div class="price_row"><div class="fl"><div class="task_name">' +
            data.task_name + '</div></div><div class="fr"><div class="task_block_content"><div class="task_name">Площадь</div><div class="input_w"><div class="f_input_v2 f_input volumeControl _control_mode" data-unit="<span>м</span><sup>2</sup>,<span>м</span>,<span>шт</span>" data-active="0"><input class="volumeSize" value="20" type="hidden" data-min="1" data-max="1000" data-step="1"><input class="volumeUnit" value="м2" type="hidden"><span class="volumeVal"><input value="20" data-inputmask="\'alias\': \'numeric\', \'rightAlign\': false, \'allowMinus\': false, \'allowPlus\': false, \'autoGroup\': false, \'groupSeparator\': \'\', \'autoUnmask\': true, \'digits\': 1, \'placeholder\': \'0\', \'digitsOptional\': false"><span class="unitSwitcher"><span>м</span><sup>2</sup></span></span><span class="btn_v3 counter_btn _minus valMinus"></span><span class="btn_v3 counter_btn _plus valPlus"></span></div></div></div><div class="task_block_toggle"><a class="gl_link _rm rmTaskBtn" href="#' + id + '"><span class="_off">удалить</span></a></div></div></div>' +
            '<div class="task_estimate_block"><div class="task_estimate_date"><span class="task_step">' + data.stage + '</span><span class="task_period">' +
            data.date_start + ' - ' +
            data.date_finish + '</span></div><dl class="task_estimate_list">';

          for (var key in data.tasks) {
            if (data.tasks.hasOwnProperty(key)) {
              var task = data.tasks[key];

              est_block += '<dt>' + task.name + '</dt><dd>' + formatPrice(task.price) + ' руб</dd>';

              work_price += task.price;

            }
          }

          est_block +=
            '' +
            '<dt class="estimate_total">Сумма</dt><dd class="estimate_total">' + formatPrice(work_price) + ' руб</dd>' +
            '</dl></div></div>';

          $('#estimations').append(est_block).closest('.mCSB').mCustomScrollbar("scrollTo", "bottom");

          clone.addClass('_clone').appendTo(row);

          var new_estimation = $('#' + id);

          clone.css({
            'opacity': 0,
            'margin-top': Math.max(-80, Math.min(300, new_estimation.offset().top - clone.offset().top)),
            'margin-left': clone.outerWidth()
          });

          setTimeout(function () {
            clone.remove();
          }, 1000);

          $('.workPrice').html(formatPrice(work_price) + ' Р');

          //$('.totalPrice').html(formatPrice(total_price) + ' Р');

          $('.dateStart').text(data.date_start);
          $('.dateFinish').text(data.date_finish);

          initMask();

        });

        updateMaterials(target.attr('data-estimate'), function (data) {
          var all_materials = '';

          if (data.success) {

            for (var key in data.materials) {
              if (data.materials.hasOwnProperty(key)) {
                var material = data.materials[key];

                all_materials += '<div class="material_block">' +
                  '<div class="material_img">' +
                  (material.image.length ? '<img src="' + material.image + '" />' : '') + '</div>' +
                  '<div class="material_name">' + material.name + '</div>' +
                  '<div class="material_store"><a class="material_link" href="' +
                  material.store_url + '">' + material.store + '</a></div>' +
                  '<dl class="material_params"><dt>Цена -</dt><dd><span class="fw_b' +
                  ((material.price_share).toString().length && material.price_share > 0 ? ' _old' : '') + '">' +
                  formatPrice(material.price) + ' Р</span></dd>' +
                  ((material.price_share).toString().length && material.price_share > 0 ? '<dt>Цена со скидкой -</dt><dd><span class="c_blue fw_b">' +
                  formatPrice(material.price - material.price_share) + ' Р</span></dd>' : '') +
                  '</dl></div>';

                material_price += material.price;
                material_share += (material.price_share).toString().length && material.price_share > 0 ? material.price_share : 0;

              }
            }

            $('.materialsCheck').attr('data-price', material_price);
            $('.materialsPrice').html(formatPrice(material_price) + ' Р');
            $('.materialsShare').html(formatPrice(material_share) + ' Р');

            $('#materials').html(all_materials);
          }

          $('.totalPrice').html(formatPrice(work_price + ( $('.materialsCheck').prop('checked') ? 0 : (material_price - material_share))) + ' Р');

        });
      }

      return false;
    })
    .delegate('.scrollTo', 'click', function () {
      var link = $(this), target = $(link.attr('href'));

      if (target.length) {
        docScrollTo(target, 1200);
      }

      return false;
    })
    .delegate('.volumeVal input', 'change', function () {
      var inp = $(this);

      inp.parent().prevAll('.volumeSize').val(inp.val());
    })
    .delegate('.changeBtn', 'click', function () {
      var link = $(this), target = $(link.attr('href'));

      if (target.length) {
        checkout_popup.dialog('close');
        docScrollTo(target, 1200);
      }

      return false;
    })
    .delegate('.materialsCheck', 'change', function () {
      var check = $(this);

      if (check.prop('checked')) {
        $('.totalPrice').html(formatPrice(work_price) + ' Р');
        $('.materialsSelf').addClass('_invis');

      } else {
        $('.totalPrice').html(formatPrice(work_price + material_price - material_share) + ' Р');
        $('.materialsPrice').html(formatPrice(material_price) + ' Р');
        $('.materialsShare').html(formatPrice(material_share) + ' Р');

        $('.materialsSelf').removeClass('_invis');

      }

      return false;
    })
    .delegate('.unitSwitcher', 'click', function () {
      var unit = $(this),
        valCell = $(this).closest('.volumeControl'),
        units = valCell.attr('data-unit').split(','),
        cur_unit = valCell.attr('data-active') * 1,
        new_unit = cur_unit >= units.length - 1 ? 0 : cur_unit + 1;

      unit.html(units[new_unit]);
      valCell.attr('data-active', new_unit);

      return false;
    })
    .delegate('.valPlus', 'click', function () {
      var valCell = $(this).closest('.volumeControl'),
        units = valCell.attr('data-unit').split(','),
        inp = valCell.find('.volumeSize'),
        txt = valCell.find('.volumeVal input'),
        unit = valCell.find('.unitSwitcher'),
        val = parseFloat(txt.val()),
        total_price = 0,
        est_unit = valCell.closest('.task_estimation'),
        min_val = 1 * inp.attr('data-min'),
        max_val = 1 * inp.attr('data-max'),
        new_val = val + (1 * inp.attr('data-step'));

      inp.val(new_val <= max_val ? (new_val >= min_val ? new_val : min_val) : max_val).focus();

      txt.val(new_val >= min_val ? (new_val <= max_val ? new_val : max_val) : min_val);

      unit.html(units[valCell.attr('data-active') * 1]);

      updatePrice(est_unit.attr('data-estimate'), function (data) {

        var new_price = '<div class="task_estimate_date"><span class="task_step">' + data.stage + '</span><span class="task_period">' +
          data.date_start + ' - ' +
          data.date_finish + '</span></div><dl class="task_estimate_list">';

        for (var key in data.tasks) {
          if (data.tasks.hasOwnProperty(key)) {

            new_price += '<dt>' + data.tasks[key].name + '</dt><dd>' + formatPrice(data.tasks[key].price) + ' руб</dd>';

            total_price += data.tasks[key].price;

          }
        }

        new_price += '<dt class="estimate_total">Сумма</dt><dd class="estimate_total">' + formatPrice(total_price) + ' руб</dd></dl>';

        est_unit.find('.task_estimate_block').html(new_price);
      });

      return false;
    })
    .delegate('.valMinus', 'click', function () {
      var valCell = $(this).closest('.volumeControl'),
        units = valCell.attr('data-unit').split(','),
        inp = valCell.find('.volumeSize'),
        txt = valCell.find('.volumeVal input'),
        unit = valCell.find('.unitSwitcher'),
        val = parseFloat(txt.val()),
        total_price = 0,
        est_unit = valCell.closest('.task_estimation'),
        new_price = '',
        min_val = 1 * inp.attr('data-min'),
        max_val = 1 * inp.attr('data-max'),
        new_val = val - (1 * inp.attr('data-step'));

      inp.val(new_val >= min_val ? (new_val <= max_val ? new_val : max_val) : min_val).focus();

      txt.val(new_val >= min_val ? (new_val <= max_val ? new_val : max_val) : min_val);

      unit.html(units[valCell.attr('data-active') * 1]);

      updatePrice(est_unit.attr('data-estimate'), function (data) {

        var new_price = '<div class="task_estimate_date"><span class="task_step">' + data.stage + '</span><span class="task_period">' +
          data.date_start + ' - ' +
          data.date_finish + '</span></div><dl class="task_estimate_list">';

        for (var key in data.tasks) {
          if (data.tasks.hasOwnProperty(key)) {

            new_price += '<dt>' + data.tasks[key].name + '</dt><dd>' + formatPrice(data.tasks[key].price) + ' руб</dd>';

            total_price += data.tasks[key].price;

          }
        }

        new_price += '<dt class="estimate_total">Сумма</dt><dd class="estimate_total">' + formatPrice(total_price) + ' руб</dd></dl>';

        est_unit.find('.task_estimate_block').html(new_price);
      });

      return false;
    })
    .delegate('.contentOverview', 'click', function () {
      animateOnce($('.workSwitcher'), 'shake');

      return false;
    })
    .delegate('.collapseBtn', 'click', function () {
      var firedEl = $(this), collapse = firedEl.toggleClass('_opened').next('.expandBlock');

      collapse.slideToggle(600, function () {
        if (firedEl.closest('.mCSB').length) {
          firedEl.closest('.mCSB').mCustomScrollbar("scrollTo", collapse);
        }
      });

      return false;
    })
    .delegate('.addTask', 'click', function () {
      var btn = $(this);

      $('.taskList').find('.addTask').not(btn).parent().removeClass('_active');

      btn.parent().toggleClass('_active');

      var task = $('.addTaskBtn').filter(function () {
        return $(this).attr('href') == btn.attr('href');
      });

      task.click();

      if (!task.is(':visible')) {
        task.closest('.expandBlock').prev().click();
      }

      $('.glOverlay').click();

      return false;
    })
    .delegate('.glOverlay', 'click', function () {
      var firedEl = $(this), target = $(firedEl.attr('href'));

      $('.megaMenuBtn').removeClass('_opened');
      $('.megaMenu').hide();
      firedEl.hide();
    })
    .delegate('.megaMenuBtn', 'click', function () {
      var firedEl = $(this), target = $(firedEl.attr('href'));

      if (target.length) {
        var show = firedEl.toggleClass('_opened').hasClass('_opened');

        toggleOverlay(show);
        target.toggle(show);
      }

    });

  $('.datePicker').each(function (ind) {
    var dp = $(this);

    dp.datepicker({
      dayNames: ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"],
      dayNamesMin: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
      monthNames: ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"],
      firstDay: 1,
      minDate: new Date(),
      showOn: "focus",
      dateFormat: "d MM, yy",
      beforeShow: function (input, inst) {
        var inp = $(input).addClass('_opened');

        setTimeout(function () {
          if (inp.attr('id') == 'date_header') {

            inst.dpDiv.removeClass('dp_v1').css({
              top: inp.outerHeight() + 32,
              left: inp.offset().left - 8
            });

            $('.megaMenuBtn').removeClass('_opened');
            $('.megaMenu').hide();
            toggleOverlay(true);
          } else {
            inst.dpDiv.addClass('dp_v1').css({
              top: inp.offset().top + inp.outerHeight() + 3,
              left: inp.offset().left
            });
          }

        }, 1);
      },
      onClose: function () {
        var inp = $(this).removeClass('_opened');

        if (inp.attr('data-correspond') != void 0) {
          var corr = $(inp.attr('data-correspond'));

          if (corr.length) {
            corr.val(inp.val());
          }
        }

        toggleOverlay(false);
      }
    }).datepicker("setDate", new Date());
  });

  initScrollBars();

  initCheckoutPopup();

  initMask();

  initValidation();

  initTabs();

  headerFix();

  if (body_var.hasClass('index')) {
    appenNotifier();
  }

  initReviewSlider();

  all_dialog_close();

  $('.checkoutForm').on('submit', function (e) {
    e.preventDefault();

    if ($(this).validationEngine('validate')) {
      checkout_popup.dialog('open');
    } else {
      animateOnce($('.errorShaker'), 'shake');
    }

    return false;
  });

});

function scrollReview(r, cb) {
  var seconds_per_slide = 300, firstRow = r.find('.reviewSlider._main');

  box = r[0];
  
  tween = TweenMax.to(box, seconds_per_slide, {
    x: (-firstRow.outerWidth()) + 'px',
    repeat: -1,
    onRepeat: onRepeat,
    repeatDelay: 0,
    ease: Linear.easeNone
  });

  function onRepeat() {
    box.style = '';
  }
}

function initReviewSlider() {

  Reviews = $('.Reviews');
  reviewSlider = $('.reviewSlider');
  reviewSlider2 = $('.reviewSlider2').before('<br>');

  reviewSlider.after(reviewSlider.clone().addClass('_clone'));
  reviewSlider2.after(reviewSlider2.clone().addClass('_clone'));

  reviewSlider.addClass('_main');
  reviewSlider2.addClass('_main');

  scrollReview(Reviews, function () {
    console.log('restart');
  });
}

function animateOnce(el, addClass, removeClass) {
  el.addClass(addClass + ' animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
    $(this).removeClass(addClass + ' ' + removeClass);
  });
}

function initCheckoutPopup() {

  checkout_popup = $('#checkout_popup').dialog({
    autoOpen: false,
    modal: true,
    closeOnEscape: true,
    closeText: '',
    dialogClass: 'dialog_close_butt_mod_1 dialog_g_size_1 dialog_g_size_2',
    //appendTo: '.wrapper',
    width: 940,
    draggable: true,
    collision: "fit",
    position: {my: "top center", at: "top center", of: window},
    open: function (event, ui) {
      //body.addClass('modal_opened overlay_v2');

      cloneMaterials();

      cloneWorks();

    },
    close: function (event, ui) {
      //body.removeClass('modal_opened overlay_v2');
    }
  });
}

function cloneMaterials() {
  $('#materials_popup').html($('#materials').html());
}

function cloneWorks() {
  var estimations = $('<div id="estimations_popup"/>');

  $('#estimations .task_estimation').each(function () {
    var est = $(this).clone();

    var volume = est.find('.task_block_content');
    var task_vol = $('<div class="task_volume" />')
      .append('<span>' + volume.find('.volumeSize').val() + ' <span>')
      .append(volume.find('.unitSwitcher').html());

    est.find('.task_block_toggle').remove();

    est.find('.task_block_content').replaceWith(task_vol);

    estimations.append(est.removeClass('animated'));

  });

  $('#estimations_popup').replaceWith(estimations);
}

function docScrollTo(pos, speed, callback) {

  body_var.mCustomScrollbar("scrollTo", pos, {scrollInertia: speed});

}

function formatPrice(s) {
  return ('' + s).replace(/(?!^)(?=(\d{3})+(?=\.|$))/gm, ' ');
}

function updatePrice(est, cb) {

  $.getJSON("get_price.json", function () {

  })
    .done(function (data) {
      if (data.success) {
        if (typeof cb == 'function') {
          cb(data);
        }
      }
    })
    .error(function () {
      console.log("error");
    })
    .always(function () {

    });
}

function updateEstimation(est, cb) {

  $.getJSON("get_estimation.json", function () {

  })
    .done(function (data) {
      if (data.success) {
        if (typeof cb == 'function') {
          cb(data);
        }
      }
    })
    .error(function () {
      console.log("error");
    })
    .always(function () {

    });
}

function updateMaterials(est, cb) {

  $.getJSON("get_materials.json", function () {

  })
    .done(function (data) {
      if (data.success) {
        if (typeof cb == 'function') {
          cb(data);
        }
      }
    })
    .error(function () {
      console.log("error");
    })
    .always(function () {

    });
}

function checkClassFunc(el) {
  return $(el).hasClass('_complete');
}

function initTabs() {

  var tabBlock = $('.tabBlock');

  tabBlock.each(function (ind) {
    var tab = $(this);

    tab.tabs({
      active: 0,
      tabContext: tab.data('tab-context'),
      activate: function (e, u) {
        $('.task_estimation.animated').removeClass('animated');
      },
      create: function (e, u) {
        $(tab.data('tab-context')).show();
      }
    });
  })

}

function initScrollBars() {

  $('.mCSB').mCustomScrollbar({
    documentTouchScroll: true,
    mouseWheel: {
      preventDefault: true
    },
    theme: "dark",
    scrollEasing: "linear",
    callbacks: {
      whileScrolling: function () {
        var el = $(this);

        if ((this.tagName).toUpperCase() == 'BODY') {
          var top = 1 * el.find('.mCSB_container').css('top').replace(/\D/g, '');

          headerFix(top);

          forceNotification(top);

        }
      }
    }
  });
}

function appenNotifier() {

  body_var.append(notifier);

  startNotifications();

}

function startNotifications() {

  $.getJSON("notifications.json", function () {

  })
    .done(function (data) {
      if (data.success) {
        var note = $('<div class="note"/>'), count = data.notes.length - 1;

        next_note = data.notes[Math.floor(Math.random() * count)].note;

        setInterval(function () {
          showNote(data.notes[Math.floor(Math.random() * count)].note);
        }, notification_timer);
      }
    })
    .error(function () {
      console.log("error");
    })
    .always(function () {

    });

}

function forceNotification() {
  if (!forced && checkout_form.length && checkout_form.offset().top < 50) {
    forced = true;
    showNote(next_note);
  }
}

function showNote(txt) {
  var note = $('<div class="note"/>');

  note.html(txt);

  notifier.html(note);
}

function initValidation() {
  $('.validateMe').each(function (ind) {
    var f = $(this);

    f.validationEngine({
      //binded: false,
      scroll: false,
      showPrompts: false,
      showArrow: false,
      addSuccessCssClassToField: 'success',
      addFailureCssClassToField: 'error',
      parentFieldClass: '.formCell',
      // parentFormClass: '.order_block',
      promptPosition: "centerRight",
      //doNotShowAllErrosOnSubmit: true,
      //focusFirstField          : false,
      autoHidePrompt: false,
      autoHideDelay: 3000,
      autoPositionUpdate: false,
      prettySelect: true,
      //clearValidationIfEmpty: true,
      //useSuffix                : "_VE_field",
      addPromptClass: 'relative_mode one_msg',
      showOneMessage: false
    });
  });
}

function initMask(el) {

  if (el == void 0) {
    el = $("input");
  }

  el.each(function (i, el) {
    var inp = $(el), param = inputMaskEvents;

    if (inp.attr('data-inputmask') != void 0) {
      inp.inputmask(param);
    }

    if (inp.attr('data-inputmask-email') != void 0) {
      param.regex = inp.attr('data-inputmask-email');
      param.placeholder = '_';

      inp.inputmask('Regex', param);
    }

    if (inp.attr('data-inputmask-regex') != void 0) {
      inp.inputmask('Regex', param);
    }

    if (inp.attr('data-inputmask-custom') != void 0) {
      inp.inputmask(JSON.parse('{' + inp.attr('data-inputmask-custom').replace(/'/g, '"') + '}'));
    }

  });
}

function toggleOverlay(show) {
  $('.glOverlay').toggle(show);
}

function all_dialog_close() {
  body_var.on('click', '.ui-widget-overlay', all_dialog_close_gl);
}

function all_dialog_close_gl() {
  $(".ui-dialog-content").each(function () {
    var $this = $(this);
    if (!$this.parent().hasClass('always_open')) {
      $this.dialog("close");
    }
  });
}

$(window).on('scroll', function () {

  //headerFix();

});

function headerFix(top) {

  if ($(window).width() <= 960) {
    header.css('margin-left', -getScrollLeft());
  } else {
    header.css('margin-left', 0);
  }

  if (price_section.length) {
    if ((top || getScrollTop()) + header.outerHeight() < price_section.offset().top) {
      header.css('top', price_section.offset().top - header.outerHeight()).addClass('_fixed').removeClass('_abs');
    } else {
      header.css('top', price_section.offset().top - header.outerHeight()).removeClass('_fixed').addClass('_abs');
    }
  }

}

function getScrollTop() {
  //return body_var.scrollTop();

  return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
}

function getScrollLeft() {
  //return body_var.scrollLeft();

  return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
}
