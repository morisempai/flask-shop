import './select';

$('#field_list').on('click', '#item_del', function() {
    $(this).parent().remove();
});

class Upload {
    constructor(file) {
        this.file = file;
        this.img_card = new ImgCard();
    }
    getType() {
        return this.file.type;
    }
    getSize() {
        return this.file.size;
    }
    getName() {
        return this.file.name;
    }
    doUpload() {
        var that = this;
        var formData = new FormData();
        // card generation
        this.img_card.update_img(URL.createObjectURL(this.file));

        // add assoc key values, this will be posts values
        formData.append("file", this.file, this.getName());
        formData.append("upload_file", true);
        var csrftoken = $('meta[name=csrf-token]').attr('content')
        $.ajax({
            type: "POST",
            url: window.location.pathname + "/upload_img",
            xhr: function() {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    //myXhr.upload.addEventListener('progress', that.progressHandling, false);
                    console.log("TODO progress bar");
                }
                return myXhr;
            },
            success: function(data) {
                that.img_card.done(data);
            },
            error: function(error) {
                that.img_card.error();
            },
            async: true,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            timeout: 60000,
	    beforeSend: function(xhr, settings) {
                if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken)
                    }
                }
        });
    }
    progressHandling(event) {
        var percent = 0;
        var position = event.loaded || event.position;
        var total = event.total;
        var progress_bar_id = "#progress-wrp";
        if (event.lengthComputable) {
            percent = Math.ceil(position / total * 100);
        }
    }
}




class ImgCard {
    constructor() {
        var that = this;
        if (ImgCard.count) {
            ImgCard.count += 1;
        } else {
            ImgCard.count = 1;
        }
        // TO DO add check if number already exist (create global counter?)
        this.id = `img-card-${ImgCard.count}`;
        this.jq_obj = $(`
                <div class="img_block">
                    <div class="loader-center" id="spinner">
                        <div class="loader"></div>
                    </div>
                    <img class="" src="/static/img/placeholder120x120.png">
                    <input id="db_input" type="hidden" name="images-${ImgCard.count}" value="">
                    <button type="button" class="btn btn-info btn-sm" id="item_del">Remove</button>
                </div>
                `);
        this.jq_obj.attr("id", this.id);
        $("#field_list").append(this.jq_obj);
    }
    update_img(url) {
        $(`#${this.id}`).find("img").attr("src", url);
    }
    done(data) {
	console.log(data)
        $(`#${this.id}`).find("#spinner").remove();
        // TO DO edit hidden input
        $(`#${this.id}`).find("#db_input").attr("value", data["db_id"]);

    }
    error() {
        $(`#${this.id}`).find("#spinner").remove()
        $(`#${this.id}`).find("img").attr("src", "/static/img/placeholder120x120.png");
    }
}

$(document).ready(function() {
    $("#exampleInputFile").on('change', function(e) {
        for (let n = 0; n < $(this)[0].files['length']; n++) {
            var file = $(this)[0].files[n];
            var upload = new Upload(file)
            console.log("Upload")
            if ($.inArray(file.type, ["image/jpeg", "image/png"]) >= 0) {
                upload.doUpload();
            } else {
                console.log("incorrect img format")
            }
        }
    });
});
