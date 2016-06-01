(function (){	
var DEV = 1; // develop mode (hide)
var autoplayOff = false; 	
autoplayOff = true;
var playlist;	//хранилище chrome
var currPlay;	//текущий проигрываемый трек
var currentPath;
var appendTo = '#initial_list';	// подгружать рядом по умолчанию

getStorage(function (result) {
	playlist = result.myData;
	
	checkPosts(document.body); //первичная проверка при загрузке страницы

	var audios_left_link = $('#side_bar ol').find('a').filter(':contains("Мои Аудиозаписи")'); //ссылка слева на мои аудоизаписи
	var audios_right_link = $("#album0");

	//проверяем адресную строку
	if(window.location.search.indexOf('act=later') > 0 && window.location.pathname.indexOf('audios') > 0) {
		console.log('сработало act=later: '+ $("#listen_later").hasClass('selected'));
		addMenuTo('#side_filters');
		showLinks();
	}

	// Создадим observer для нотификаций о появлении новых постов на странице
	var listObserver = new MutationObserver(elementAdded);	
	listObserver.observe(document.body, {childList: true, subtree: true});	

	//----------------------------------------------------------------ФУНКЦИИ-------------------------------------------------------------------
	//находим посты и отправляем на добавление ссылок
	function checkPosts(node){
		$(node).find('.post').each(function(index, el) {
			if($(this).find('.wall_text .wall_audio').length) addLinks(el);
		});
	}

	// вызывается при любой модификации DOM страницы
	function elementAdded(mutations) {
		var path = window.location.pathname;
		
		/*if(currentPath != path) {
			console.log(path);
			if(path.indexOf('audios') > 0) addMenuTo();	//открыта страница аудиозаписей
		}
		currentPath = path;*/


		/*if($('#search_list').is(':visible') && $('#listen_later').hasClass('selected') || 
			$('#pad_search_list').is(':visible') && $('#listen_later').hasClass('selected')) {
			console.log('активировался поиск');
			if($('#search_list').val() != '' || $('#pad_search').val() != '') hideLinks();
		}*/

		if(!$("#listen_later").length) {
			if($('#album0').length) addMenuTo('#side_filters');
			if($('#pad_album_filters').length) addMenuTo('#pad_side_filters');
		}
		

		for (var i = 0; i < mutations.length; i++) {
			var added = mutations[i].addedNodes;

			$.each(added,function(index, el) {
				if($(this).find('.post').length) checkPosts(el);	//если есть посты, проверить

				//autoplay
				if($(this).hasClass('wk_cont')) {
					if(autoplayOff || currPlay != undefined && $(this).find('.audio .area').first() == currPlay) return;
					//записываем текущий трек в обьект
					currPlay = $(this).find('.audio .area').first();
					//autoplay только если открыты аудиозаписи
					if(path.indexOf('audios') > 0) currPlay.trigger('click');
				}
			});

		}
	}
	
	// Добавляет ссылку "Послушать позже"" к выбранном посту
	function addLinks(row) {
		// console.log(row);
		var self = $(row);

		// может, наша ссылка уже есть? Так бывает, если вконтакте перемещает список из одного элемента в другой
		if (self.find('.post_later').length) {
			console.log('ссылка уже добавлена для '+row);
			return;	
		}

		//собираем информаицю из поста
		var link = self.find('.rel_date').parent().attr('href'); link = link.substr(1);
		var name = self.find('.wall_text_name .author').html();
		var date = self.find('.rel_date').attr('time');
		var id = self.closest('.post').attr('id');

		//добавляем ссылку
		self.find('.post_full_like').append('<div class="post_share post_later fl_r"><span class="post_share_link fl_l" >Послушать позже</span><span class="post_later_plus fl_l" ></span></div>');

		//если запись уже добавляли, отобразить это и вернуться
		$.each(playlist, function(index, obj) {
			if(obj.link == link) {
				self.find('.post_later').addClass('active');
				return;
			}
		});

		self.find('.post_later').on('click', function(event) {
			event.preventDefault();
			if($(this).hasClass('active')) {
				//удаляем из хранилища
				removeFromStorage({link: link});
			} else {
				//добавляем в хранилище
				addToStorage({id: id, name: name, date: date, link:link});
			}
			$(this).toggleClass('active');
			if(!DEV) $(this).fadeOut(400);
			
		});
	}

	function addMenuTo(selector) {
		appendTo = '#initial_list';
		if(selector == '#pad_side_filters') appendTo = '#pad_playlist';

		console.log('addMenuTo()');

		$('<div class="listen_later_wrap audio_filter"><div id="listen_later" class="audio_filter" onmouseover="if (Audio.listOver) Audio.listOver(this)" onmouseout="if (Audio.listOut) Audio.listOut(this)" ><div class="label">Послушать позже</div></div></div>').prependTo(selector);

		$('#listen_later').on('click', function(event) {
			if(selector == '#side_filters') history.pushState(null, null, '?act=later');
			showLinks();
		});

	}


	function showLinks() {
		// $("#s_search").prop('disabled', true);

		//Назначаем обработчики-перехватичики для правильного переключения ссылок Мои аудиозаписи 
		audios_left_link.on('click', function(event) {
			hideLinks();
			history.pushState(null, null, '');
		});
		audios_right_link.on('click', function(event) {
			history.pushState(null, null, '?');
		});
		$('#album_filters,#pad_album_filters').on('click', function(event) {
			hideLinks();
		});



		/*if($('#s_search').is(':visible') || $('#pad_search').is(':visible')) {
			$('#s_search,#pad_search').val('');
			$('#search_list,#pad_search_list').fadeOut().empty();
		}
*/



		$('#initial_list_2').fadeOut().empty();
			
		var container = $('<div id="initial_list_2"></div>');

		// container.insertAfter(appendTo);
		console.log(appendTo);
		container = $(appendTo);

		// $(appendTo).fadeOut();
		console.log('pered empty');
		$(appendTo).empty();

		chrome.storage.sync.get({myData: []}, function (result) {
		    var myData = result.myData;
			

			for (var i = 0; i < myData.length; i++)(function(i) {
				
				var element = $('<div class="link_remove_wrap fl_r"><div class="link_remove"></div></div>');
				element.on('click', function(event) {
					event.stopPropagation();
					editStorage(i);
				});

				
				var date = new Date(parseInt(myData[i].date));
				var options = {
				  year: 'numeric',
				  month: 'long',
				  day: 'numeric',
				  hour: 'numeric',
				  minute: 'numeric',
				  second: 'numeric'
				};
				
				container.append('<div onclick="return showWiki({w: \''+myData[i].link+'\'}, false, event);" class="link_elem" id="link_elem_'+i+'"><div class="play_link_btn_wrap"><div class="play_link_new"></div></div><a onclick="return showWiki({w: \''+myData[i].link+'\'}, false, event);" href="/'+myData[i].link+'"><b>'+myData[i].name+'</b> ('+date.toLocaleString("ru", options)+')</a></div>');
				$("#link_elem_"+i).append(element);
				
			})(i);
			$('#more_link,#pad_more_audio').hide();
		    $('#album_filters,#pad_album_filters').children().removeClass('selected');
		    $('#listen_later').addClass('selected');


		    // ------------------------------------------------------------------- кнопки play\pause
		 //    $('.link_elem').each(function(index, el) {
			// 	$(this).on('click', function(event) {
			// 		$(this).find('.play_link_new').toggleClass('playing');
			// 	});
			// });
		});
	}

	function hideLinks() {
		console.log('сработала функция hideLinks');
		// $("#s_search").prop('disabled', false);


		$('#initial_list_2').fadeOut().empty();
		$(appendTo).fadeIn();

		$('#listen_later').removeClass('selected');
	    // $('#album0,#pad_current_filter').addClass('selected');

	}




	function addToStorage(data) {
		chrome.storage.sync.get({myData: []}, function (result) {
		    var myData = result.myData;
			var date = new Date();
		    date = Date.parse(date);
		    myData.push({name: data.name, date: date, link: data.link});	//
		    chrome.storage.sync.set({myData: myData}, function () {
		        //выполнится после сохранения данных
		    });
		});	
	}

	function removeFromStorage(data) {
		chrome.storage.sync.get({myData: []}, function (result) {
		    var myData = result.myData;

		    var removedId;
		    $.each(myData, function(index,value) {
		    	if(value.link == data.link) removedId = index;
		    });

		    console.log('removeId: '+removedId);
		    myData.splice(removedId, 1);

		    chrome.storage.sync.set({myData: myData}, function () {
		        //выполнится после сохранения данных
		    });
		});
	}

    function editStorage(id) {
      	chrome.storage.sync.get({myData: []}, function (result) {
		    var myData = result.myData;
		    myData.splice(id, 1);
		    chrome.storage.sync.set({myData: myData}, function () {
		    	$("#link_elem_"+id).remove();
		    });
		});
    }
    
    function clearStorage(argument) {
    	chrome.storage.sync.clear();
    }

	}); 
	//first main function чтобы взять инфу
    function getStorage(callback) {
		chrome.storage.sync.get({myData: []}, callback);
	}
})();