'use strict';

(function () {
	var dropzone = document.getElementById('dropzone');
	var fileInput = document.getElementById('fileInput');
	var selectBtn = document.getElementById('selectFilesBtn');
	var uploads = document.getElementById('uploads');

	// Check if required elements exist
	if (!dropzone || !fileInput || !uploads || !selectBtn) {
		console.error('Required upload elements not found');
		return;
	}

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

	function showToast(message, type = 'success') {
		// Using a simple alert for now, you can replace with your toast notification system
		if (window.showToast) {
			window.showToast(message, type);
		} else {
			alert(message);
		}
	}

	function validateFile(file) {
		var errors = [];
		var maxFileSize = 10 * 1024 * 1024; // 10MB
		var allowedExtensions = /\.(jpeg|jpg|png|gif|webp|svg|mp4|avi|mov|pdf|doc|docx|xls|xlsx|mp3|wav)$/i;
		var allowedMimeTypes = [
			'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
			'video/mp4', 'video/avi', 'video/quicktime', 'application/pdf',
			'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'audio/mpeg', 'audio/wav', 'audio/mp3'
		];
		
		// Check file size
		if (file.size > maxFileSize) {
			errors.push('File "' + file.name + '" is too large (' + bytesToSize(file.size) + '). Maximum size is 10MB.');
		}
		
		// Check file extension
		if (!allowedExtensions.test(file.name)) {
			errors.push('File "' + file.name + '" has an invalid extension. Only images, videos, documents, and audio files are allowed.');
		}
		
		// Check MIME type
		var mimetypeAllowed = allowedMimeTypes.indexOf(file.type) !== -1 || 
							  file.type.indexOf('image/') === 0 || 
							  file.type.indexOf('video/') === 0 || 
							  file.type.indexOf('audio/') === 0;
		
		if (!mimetypeAllowed) {
			errors.push('File "' + file.name + '" has an invalid type (' + file.type + '). Only images, videos, documents, and audio files are allowed.');
		}
		
		return errors;
	}

	function handleFiles(fileList) {
		Array.from(fileList).forEach(function(file){
			var validationErrors = validateFile(file);
			if (validationErrors.length > 0) {
				showToast(validationErrors.join('\n'), 'error');
				return;
			}
			uploadFile(file);
		});
	}

	function uploadFile(file) {
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

		// Create FormData and upload
		var formData = new FormData();
		formData.append('files', file);

		var xhr = new XMLHttpRequest();

		// Progress tracking
		xhr.upload.addEventListener('progress', function(e) {
			if (e.lengthComputable) {
				var percentComplete = (e.loaded / e.total) * 100;
				bar.style.width = percentComplete + '%';
			}
		});

		// Upload complete
		xhr.addEventListener('load', function() {
			try {
				if (xhr.status === 200) {
					var response = JSON.parse(xhr.responseText);
					if (response.success) {
						bar.classList.remove('progress-bar-animated');
						bar.classList.remove('progress-bar-striped');
						bar.classList.add('bg-success');
						
						// Show success message
						var successMsg = document.createElement('p');
						successMsg.className = 'text-success small mt-1';
						successMsg.textContent = 'Upload complete!';
						meta.appendChild(successMsg);
						
						showToast('File uploaded successfully!', 'success');
					} else {
						handleUploadError(item, bar, response.message || 'Upload failed');
					}
				} else {
					// Handle HTTP error responses
					var errorMessage = 'Upload failed';
					try {
						var errorResult = JSON.parse(xhr.responseText);
						if (errorResult.message) {
							errorMessage = errorResult.message;
						}
					} catch (parseError) {
						// If response is not JSON, use status-based message
						if (xhr.status === 413) {
							errorMessage = 'File too large. Maximum size is 10MB.';
						} else if (xhr.status === 415) {
							errorMessage = 'Invalid file type. Only images, videos, documents, and audio files are allowed.';
						} else {
							errorMessage = 'Upload failed (Error ' + xhr.status + ')';
						}
					}
					handleUploadError(item, bar, errorMessage);
				}
			} catch (parseError) {
				console.error('Error parsing response:', parseError);
				handleUploadError(item, bar, 'Upload failed - Invalid server response');
			}
		});

		// Upload error
		xhr.addEventListener('error', function() {
			handleUploadError(item, bar, 'Network error occurred');
		});

		// Send request
		xhr.open('POST', '/api/media/upload');
		xhr.send(formData);
	}

	function handleUploadError(item, bar, message) {
		bar.classList.remove('progress-bar-animated');
		bar.classList.remove('progress-bar-striped');
		bar.classList.add('bg-danger');
		
		var errorMsg = document.createElement('p');
		errorMsg.className = 'text-danger small mt-1';
		errorMsg.textContent = message;
		item.querySelector('.meta').appendChild(errorMsg);
		
		showToast(message, 'error');
	}

	// Drag and drop events
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

	selectBtn.addEventListener('click', function(e){ 
		e.preventDefault();
		e.stopPropagation();
		fileInput.click(); 
	});
	fileInput.addEventListener('change', function(e){ 
		handleFiles(e.target.files);
		// Reset input so same file can be uploaded again
		e.target.value = '';
	});
})();
