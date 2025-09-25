'use strict';

(function () {
	var dropzone = document.getElementById('dropzone');
	var fileInput = document.getElementById('fileInput');
	var selectBtn = document.getElementById('selectFilesBtn');
	var triggerBtn = document.getElementById('triggerInput');
	var uploads = document.getElementById('uploads');

	function preventDefaults(e) {
		e.preventDefault();
		e.stopPropagation();
	}

	function bytesToSize(bytes) {
		var sizes = ['B', 'KB', 'MB', 'GB'];
		if (bytes === 0) return '0 B';
		var i = Math.floor(Math.log(bytes) / Math.log(1024));
		return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	}

	function handleFiles(fileList) {
		Array.from(fileList).forEach(function(file){
			addUploadItem(file);
		});
	}

	function addUploadItem(file) {
		var item = document.createElement('div');
		item.className = 'item';

		var thumb = document.createElement('div');
		thumb.className = 'thumb';

		var meta = document.createElement('div');
		meta.className = 'meta';

		var name = document.createElement('p');
		name.className = 'name';
		name.textContent = file.name;

		var sub = document.createElement('p');
		sub.className = 'sub';
		sub.textContent = bytesToSize(file.size);

		var progress = document.createElement('div');
		progress.className = 'progress';
		var bar = document.createElement('div');
		bar.className = 'progress-bar progress-bar-striped progress-bar-animated';
		bar.style.width = '0%';
		progress.appendChild(bar);

		meta.appendChild(name);
		meta.appendChild(sub);
		meta.appendChild(progress);

		item.appendChild(thumb);
		item.appendChild(meta);
		uploads.appendChild(item);

		if (file.type && file.type.startsWith('image/')) {
			var url = URL.createObjectURL(file);
			thumb.style.backgroundImage = 'url(' + url + ')';
		}

		// Simulated upload progress (placeholder for real upload)
		var pct = 0;
		var timer = setInterval(function(){
			pct += 10;
			bar.style.width = pct + '%';
			if (pct >= 100) {
				clearInterval(timer);
				bar.classList.remove('progress-bar-animated');
				bar.classList.remove('progress-bar-striped');
			}
		}, 120);
	}

	['dragenter','dragover','dragleave','drop'].forEach(function(eventName){
		dropzone.addEventListener(eventName, preventDefaults, false);
	});

	['dragenter','dragover'].forEach(function(eventName){
		dropzone.addEventListener(eventName, function(){ dropzone.classList.add('dragover'); });
	});
	['dragleave','drop'].forEach(function(eventName){
		dropzone.addEventListener(eventName, function(){ dropzone.classList.remove('dragover'); });
	});

	dropzone.addEventListener('drop', function(e){
		var dt = e.dataTransfer;
		var files = dt.files;
		handleFiles(files);
	});

	selectBtn.addEventListener('click', function(){ fileInput.click(); });
	triggerBtn.addEventListener('click', function(){ fileInput.click(); });
	fileInput.addEventListener('change', function(e){ handleFiles(e.target.files); });
})();
