const nodemailer = require('nodemailer');

const account = {
    user: 'thanhthanglong01@gmail.com',
    pass: '12345678@_'
}



const sendEmailFun = (mailOption) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: account.user,
            pass: account.pass
        }
    })
    transporter.sendMail(mailOption, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })
}
const sendMail = (req, res, postId) => {


    //send user
    const mailOtionUser = {
        from: account.user,
        to: req.user.email,
        subject: "Chờ xác thực bài đăng TroVN",
        html: `<h3>Cám ơn bạn ${req.user.name} đã tin tưởng và sử dụng phần mềm của chúng tôi!</h3>
        <p>Phòng hỗ trợ, tư vấn khách hàng của ứng dụng TroVn
        đã nhận được bài đăng của bạn. Đầu tiên chúng tôi cảm ơn
        bạn đã tin tưởng vào ứng dụng của chúng tôi để quảng bá
        nhà trọ của bạn. Bài đăng của bạn đang được phê duyệt
        trước khi được đưa lên bảng tin hệ thống. Chúng tôi
        rất xin lỗi về sự bất tiện này, nhưng để giữ được sự uy tín
        của ứng dụng việc này là cần thiết. Mã bài đăng của bạn là: ${postId}</p>
        <p>Bạn vui lòng liên hệ với quản trị viên nếu bài viết của bạn 
        là hợp lý mà chưa được duyệt. Xin chân thành cảm ơn!</p>
        <p>THÔNG TIN LIÊN HỆ HỖ TRỢ</p>
        <p>PHONE: 0983349999 (MR.Long)</p>
        <p>Zalo: 0983349999 (LONG HOANG)</p>
        <p>Chức năng đang trong quá trình phát triển và được sử dụng hoàn toàn miễn phí. Hãy góp ý giúp chúng tôi thông quan email này</p>`
    }
    sendEmailFun(mailOtionUser)


    //send add admin

    const mailOtionAdmin = {
        from: account.user,
        to: 'ngocthangkt27@gmail.com',
        subject: `Duyệt bài đăng: ${req.body.title}`,
        html: `<h3>Một user mới đăng bài trên TroVn</h3>
        <p>Duyệt bài đăng tại ${process.env.BASE_URL_ADMIN}/post/${postId}</p>`
    }
    sendEmailFun(mailOtionAdmin)
}

const notificationLiked = (emailUserPost, userLiked, postId) => {
    if (emailUserPost === userLiked.email) {
        return
    }
    const mailOption = {
        from: account.user,
        to: emailUserPost,
        subject: `Người dùng quan tâm bài đăng`,
        html: `<h3>Người dùng ${userLiked.name} đã quan tâm đến bài đăng của bạn</h3>
        <p>Bài đăng của bạn trên TroVn vừa được người dùng ${userLiked.name} quan
        tâm đến. Email này được gửi đến bạn với mục đích để bạn có thể 
        chủ động liên hệ tư vấn cho người vị khách đó để có tỉ lệ 
        thuê tăng lên một cách nhanh chóng.</p>
        <p>Tên người quan tâm: ${userLiked.name}</p>
        <p>Email: ${userLiked.email}</p>
        <p>SDT: ${userLiked.phone ? userLiked.phone : "Chưa có thông tin"}</p>
        <p>Bạn có thể xem bài đăng của bạn theo đường link: ${process.env.BASE_URL_ADMIN}/post/${postId} </p>
        <p>THÔNG TIN LIÊN HỆ HỖ TRỢ</p>
        <p>PHONE: 0983349999 (MR.Long)</p>
        <p>Zalo: 0983349999 (LONG HOANG)</p>
        `
    }
    sendEmailFun(mailOption)
}

module.exports = { sendMail, notificationLiked };