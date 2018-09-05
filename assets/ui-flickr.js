function getHdParam() {
    var regex = /[^a-z]*hd=(\d+)/g;
    var matched = regex.exec(document.location.search);

    if (matched) {
        return parseInt(matched[1], 10) > 0;
    }

    return true;
}

if ($("body").data("isflickr")) {
    if (!$("body").data("ispublic")) {
        $("#btnFlickrLink").hide();
        $("#btnFlickr").find("br").hide();
    }

    var isHd = getHdParam();

    $("#btnHd").html("HD <span class='status'>" + (isHd ? "on" : "off") + "</span>").click(function (e) {
        e.preventDefault();
        document.location.search = "?hd=" + (isHd ? "0" : "1");
    });

    $("#btnFlickr").show();
}
