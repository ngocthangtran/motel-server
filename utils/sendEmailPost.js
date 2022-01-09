const nodemailer = require('nodemailer');

const account = {
    user: 'thanhthanglong01@gmail.com',
    pass: '12345678@_'
}

const sendMail = (req, res) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: account.user,
            pass: account.pass
        }
    })

    //send user
    const mailOtionUser = {
        from: account.user,
        to: req.user.email,
        subject: "Chờ xác thực bài đăng TroVN",
        html: `<h3>Cám ơn bạn ${req.user.name} đã tin tưởng và sử dụng phần mềm của chúng tôi!</h3>
    <p>Bài đăng của bạn đang được các admin kiểm duyệt sẽ và sẽ được đăng trong thời gian sớm nhất.</br>
    Trong thời gian chờ đợi bạn có thể xem qua các chức năng khác của ứng dụng như quản lý nhà trọ cho bạn.</br>
    Chức năng đang trong quá trình phát triển và được sử dụng hoàn toàn miễn phí. Hãy góp ý giúp chúng tôi thông quan email này</p>`
    }

    transporter.sendMail(mailOtionUser, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    })

    //send add admin
}

module.exports = sendMail;