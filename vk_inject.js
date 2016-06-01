(function (){	
var DEV = 1; // develop mode (hide)
var autoplayOff = false; 	
autoplayOff = true;
var playlist;	//хранилище chrome
var currPlay = {
	link_elem: '',	// обьект ссылки открываемого поста (link_elem)
	track_elem: ''	// обьект первого трека в всплывающем посте
};	//текущий проигрываемый трек
var clickedOnPlay = false;
var currentpath = window.location.pathname;



var appendTo = '#initial_list,#pad_playlist';	// куда подгружать
var choosePlace = {
	'#side_filters': '#initial_list',
	'#pad_side_filters': '#pad_playlist'
};

var removeDownload = true;


alert('test');

/*
$('#ac_title').change(function(event) {
	console.log('fun');
	alert(this.html());
});
*/

getStorage(function (result) {
	playlist = result.myData;
	
	checkPosts(document.body); //первичная проверка при загрузке страницы
	addSearchLink(document.body) //первичная проверка на добавление ссылки поиска
	// observePlayer();

	var audios_left_link = $('#side_bar ol').find('a').filter(':contains("Мои Аудиозаписи")'); //ссылка слева на мои аудоизаписи
	var audios_right_link = $("#album0");

	//проверяем адресную строку
	if(window.location.search.indexOf('act=later') > 0 && currentpath.indexOf('audios') > 0) {
		console.log('сработало act=later: '+ $("#listen_later").hasClass('selected'));
		addMenuTo();
		showLinks();
	}

	// Создадим observer для нотификаций о появлении новых постов на странице
	var listObserver = new MutationObserver(elementAdded);	
	listObserver.observe(document.body, {childList: true, subtree: true});	

	//----------------------------------------------------------------ФУНКЦИИ-------------------------------------------------------------------
	//находим посты и отправляем на добавление ссылок
	function checkPosts(node){
		$(node).find('.post_table').each(function(index, el) {
			if($(this).find('.wall_audio').length) addLinks(el);
		});
		if(currentpath.indexOf('wall') > 0) {
			addLinks($('#fw_post'));
		}
	}
	function addSearchLink(node) {
		console.log('addSearchLink worked, here\'s node:');
		console.log(node);
		if($('#search_link').length || $(node).find('#public_followers a').attr('href') == undefined) return;
		var $search_link = $(getView('search_link'));
		var search_link_href = $(node).find('#public_followers a').attr('href').split('=');

		$(node).find('#page_wall_posts_count').after($search_link);


		search_link_href = '/wall-'+ search_link_href[search_link_href.length-1] + '?owners_only=1&q=%2B';

		$search_link.attr('href', search_link_href);
	}

	function isGroup(argument) {
		
	}

	// вызывается при любой модификации DOM страницы
	function elementAdded(mutations) {
		currentpath = window.location.pathname;
		
		/*if(currentPath != path) {
			console.log(path);
			if(path.indexOf('audios') > 0) addMenuTo();	//открыта страница аудиозаписей
		}
		currentPath = path;*/


		/*if($('#search_list:visible').length && $('#listen_later').hasClass('selected') || 
			$('#pad_search_list:visible').length && $('#listen_later').hasClass('selected')) {
			if(window.location.search.indexOf('act=later') > 0) {
				console.log('return');
				return;
			}
			console.log('активировался поиск');
			// if($('#search_list').val() != '' || $('#pad_search').val() != '') hideLinks();
			console.log(window.location.search.indexOf('act=later') < 0);
			hideLinks();
			
		}*/



		
		
		// if($(mutations).filter('#wl_post').length) console.log('evrika umnee');		//не срабатывает


		for (var i = 0; i < mutations.length; i++) {
			var added = mutations[i].addedNodes;
			
			// if($(added).closest('#wl_post').length) console.log('evrika');

			

			//убрать лишние пункты меню расширения MusicSig
			if(removeDownload && $(added).filter('.download_controls').length) {
				$('.download_controls .txt, .download_controls .download_all').hide();
				
			}
			//проверка на наличие меню + если его еще нет - добавить
			if($('#side_filters,#pad_side_filters').length && !$("#listen_later").length) {
				addMenuTo();
			}

			/*if($(added).filter('#ac_title').length) {
				console.log('есть контакт. Трек: '+$('#ac_title').html());
			}*/

			$.each(added,function(index, el) {
				if($(this).find('.post_table').length) checkPosts(this);

				if($(this).find('#page_wall_header').length) addSearchLink(this);


				//autoplay
				if($(this).hasClass('wk_cont')) {
					//записываем текущий трек в обьект
					currPlay.track_elems = $(this).find('#wl_post_body_wrap .audio .area');
					// var closeClick = $(this).find('#wk_close_link');
					currPlay.track_elems.click(function(event) {
						$('#initial_list_2 .link_elem').removeClass('playing paused active');
						currPlay.link_elem.addClass('playing active');
					});
					if(autoplayOff && !clickedOnPlay || currPlay.track_elems != undefined && $(this).find('.audio .area').first() == currPlay.track_elems) return;
					
					//autoplay только если открыты аудиозаписи
					if(currentpath.indexOf('audios') > 0 || $('#pad_playlist_panel').length) {
						
						currPlay.track_elems[0].click();
						// $(this).delay(300).find('.audio .area')[0].click();
						$(this).find('#wk_close_link')[0].click();
					}
					//сбрасываем.
					clickedOnPlay = false;


				}
			});

		}
	}
	
	// Добавляет ссылку "Послушать позже"" к выбранном посту
	function addLinks(row) {
		var view = 'post_link';
		var self = $(row);
		
		// console.log(row);

		// может, наша ссылка уже есть? Так бывает, если вконтакте перемещает список из одного элемента в другой
		if (self.find('.post_later').length) {
			console.log('ссылка уже добавлена для '+row);
			return;	
		}

		//собираем информаицю из поста
		// var name = self.find('.wall_text_name .author').html();
		// var id = self.closest('.post').attr('id');
		var durationArr = [];
		self.find('.wall_audio .audio .duration').each(function(index, el) {
			durationArr.push(el.innerHTML);
		});
		var data = {
			date: self.find('.rel_date').attr('time'),
			link: self.find('.rel_date').parent().attr('href') || currentpath,
			firstTrack: {
				artist: self.find('.audio').first().find('.title_wrap a').html(),
				name: self.find('.audio').first().find('.title_wrap .title').html()
			},
			count: self.find('.wall_audio .audio').length,
			duration: summTime(durationArr)
		}
		if(data.link != undefined) data.link = data.link.substr(1);
		
		console.log(data);
		
		

		//добавляем ссылку
		if(self.hasClass('wall_module')) {
			self.find('.reply_link').before(getView('post_link_separate'));
			console.log('TESTTTTTTT');
		} else {
			self.find('.post_full_like').append(getView('post_link'));
		}
		//если запись уже добавляли, отобразить это и вернуться
		$.each(playlist, function(index, obj) {
			if(obj.link == data.link) {
				self.find('.post_later').addClass('active');
				return;
			}
		});

		self.find('.post_later').on('click', function(event) {
			event.preventDefault();
			if($(this).hasClass('active')) {
				//удаляем из хранилища
				removeFromStorage({link: data.link});
			} else {
				//добавляем в хранилище
				addToStorage({artist: data.firstTrack.artist, name: data.firstTrack.name, date: data.date, link: data.link, count: data.count, duration: data.duration});
			}
			$(this).toggleClass('active');
			if(!DEV) $(this).fadeOut(400);
			
		});
	}

	function addMenuTo() {
		console.log('addMenuTo()');
		$(getView('load_links')).prependTo('#side_filters, #pad_side_filters');

		$('#listen_later').on('click', function(event) {
			if(window.location.pathname.indexOf('audios') > 0) history.pushState(null, null, '?act=later');
			showLinks();
		});
	}


	function showLinks() {
		console.log('showLinks()');
		/*if($('#initial_list_2').is(':visible')) {
			hideLinks();
		}*/
		if($('#ac_load_line').css('width') == '0px') {
			// var volume = $('#ac_vol_line').css('width');
			// $('#ac_vol_line').css('width', '0px');
			// $('#ac_vol').addClass('down');
			$('#ac_play').trigger('click').trigger('click');
			// $('#ac_vol_line').css('width', '100%');
		}

		$("#s_search,#pad_search").prop('disabled', true).addClass('disabled');

		if($('#s_search').is(':visible') || $('#pad_search').is(':visible')) {
			$('#s_search,#pad_search').val('');
			$('#audio_query_reset').removeClass('shown');
			$('#search_list,#pad_search_list').fadeOut().empty();
			$('#s_more_link').hide();
		}

		$('#initial_list_2').fadeOut().remove();
			
		var container = $(getView('main'));
		container.insertAfter(appendTo);


		$(appendTo).fadeOut();

		getStorage(function (result) {
		    var myData = result.myData;
			console.log(myData);

			for (var i = 0; i < myData.length; i++)(function(i) {
				
				var removeLink = $(getView('remove_link'));
				removeLink.on('click', function(event) {
					event.stopPropagation();
					// editStorage(i);
					removeFromStorage({link: myData[i].link});
					$(this).closest('.link_elem').remove();
				});


				var element = $(getView('later_element', myData[i]));

				container.append(element);

				
				element.find('.actions').append(removeLink)


				//toggle Lyrics
				/*element.find('a').click(function(event) {
					var next = $(this).closest('.area').next();
					if(next.hasClass('lyrics')) {
						next.toggle();
						return;
					}
				var info = $('<div class="lyrics" nosorthandle="1" style="display: none;"><b>Добавлено:</b> '+date.toLocaleString("ru", options)+'</div>');
					element.append(info);
					info.toggle();
				});*/

				element.find('.play_btn_wrap').click(function(event) {
					var selfi = $(this).parent().parent().parent();

					if($('#ac_title,#pd_title').html() == $.trim(selfi.find('.title').html()) && $('#ac_play,#pd_play').hasClass('playing') && !selfi.hasClass('active')) {
						console.log('hack');
						container.find('.link_elem').removeClass('playing paused active');
						selfi.addClass('playing active');
						event.stopPropagation();
						return;
					}

					clickedOnPlay = true;
					if(selfi.hasClass('playing') || selfi.hasClass('paused')) {
						$('#ac_play,#pd_play').click();
						event.stopPropagation();
						return;
					}
					//смена текущего .active трека
					container.find('.link_elem').removeClass('playing paused active');
					selfi.addClass('playing active');
				});

				element.click(function(event) {
					currPlay.link_elem = element;
				});
				
			})(i);

			$('#more_link,#pad_more_audio').hide();
		    $('#album_filters,#pad_album_filters').children().removeClass('selected');
		    $('#listen_later').addClass('selected');

		    $('#initial_list_2').css('min-height', $('#side_filters').outerHeight()+20);

		    //если обработчики уже назначены выйти
		    if($('#ac_play,#pd_play').attr('handlers')) return;

		    //Назначаем обработчики-перехватичики для правильного переключения ссылок Мои аудиозаписи
			audios_left_link.on('click', function(event) {
				if(event.which == 2) return;
				hideLinks();
				history.pushState(null, null, '');
			});
			audios_right_link.on('click', function(event) {
				history.pushState(null, null, '?');
			});
			$('#album_filters,#pad_album_filters').on('click', function(event) {
				hideLinks();
			});

		    //play\pause
			$('#ac_play,#pd_play').click(function(event) {

				$('#initial_list_2').find('.playing,.paused').toggleClass('playing').toggleClass('paused');
			});
			
			//обработка next\prev +
			//реализация следующего предыдущего трека в послушать позже
			$('#ac_next,#pd_next').click(function(event) {
				if($.trim(currPlay.track_elems.first().find('.title').html()) == $('#ac_title,#pd_title').html()) {
					$('#initial_list_2 .active').next().find('.play_btn_wrap').click();
				}
				container.find('.paused').toggleClass('playing').toggleClass('paused');
			});

			$('#ac_prev,#pd_prev').click(function(event) {
				if($.trim(currPlay.track_elems.first().find('.title').html()) == $('#ac_title,#pd_title').html()) {
					$('#initial_list_2 .active').prev().find('.play_btn_wrap').click();
				}
				container.find('.paused').toggleClass('playing').toggleClass('paused');
			});
			$('#ac_play,#pd_play').attr('handlers', true);
		});
	}

	function hideLinks() {
		console.log('сработала функция hideLinks');

		//отключаем обработчики



		$('#initial_list_2').fadeOut().remove();
		$(appendTo).fadeIn();

		$('#listen_later').removeClass('selected');

		$("#s_search,#pad_search").prop('disabled', false).removeClass('disabled');
	}

	function addToStorage(data) {
		chrome.storage.sync.get({myData: []}, function (result) {
		    var myData = result.myData;
			var date = new Date();
		    date = Date.parse(date);
		    myData.push({artist: data.artist, name: data.name, date: date, link: data.link, count: data.count, duration: data.duration});	//
		    chrome.storage.sync.set({myData: myData}, function () {
		        //выполнится после сохранения данных
		        console.log('Added to storage: '+data.link);
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
		        playlist = myData;
		    });
		});
	}

    
    

}); 

//first main function чтобы взять инфу
function getStorage(callback) {
	chrome.storage.sync.get({myData: []}, callback);
}
function clearStorage(argument) {
	chrome.storage.sync.clear();
}
function summTime(times) {
	var allMinutes = 0, allSeconds = 0, allHours = 0;
	if(typeof times !== "string") {
		$.each(times, function(index, el) {
			el = el.split(':');
			if(el.length == 3) { allHours += +el[0]}
			allMinutes += +el[el.length-2];
			allSeconds += +el[el.length-1];
		});
	} else {
		allSeconds = +times;
		while(allSeconds >= 60) {
			allSeconds -=60;
			allMinutes +=1;
		}
	}
	allMinutes += Math.floor(allSeconds / 60);
	while(allMinutes >= 60) {
		allMinutes -= 60;
		allHours += 1;
	}
	allSeconds = allSeconds % 60;
	if(allSeconds < 10) allSeconds = '0'+allSeconds;
	if(allMinutes < 10 && allHours > 0) allMinutes = '0'+allMinutes;

	if(allHours > 0) return allHours + ':'+allMinutes + ':' + allSeconds;
	return allMinutes + ':' + allSeconds;
}





/* injectScript(function() {
	alert("Injected script");
});*/
function injectScript(func) {
    var actualCode = '(' + func + ')();'

	var script = document.createElement('script');
	script.textContent = actualCode;
	(document.head||document.documentElement).appendChild(script);
	script.parentNode.removeChild(script);
}


function observePlayer() {
	
	

	// выбираем элемент
	var target = document.querySelector('#ac_title');
	 
	// создаем экземпляр наблюдателя
	var observer = new MutationObserver(function(mutations) {
	    mutations.forEach(function(mutation) {
	        // console.log(mutation);
	        var counter = $('.audio-observed .current .duration');
	        var currTrackDuration = $('.audio-observed .current input').val();
			currTrackDuration = currTrackDuration.split(',')[1];
			console.log(counter.html());
			console.log(summTime(currTrackDuration));
	    });    
	});
	 
	// настраиваем наблюдатель
	var config = { characterData: true, subtree: true }
	 
	// передаем элемент и настройки в наблюдатель
	observer.observe(target, config);
	 
	// позже можно остановить наблюдение
	// observer.disconnect();
}


})();

