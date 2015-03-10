<h3>注册新账户</h3>
	<a href="#" class="close" data-role="close">X</a>
	<div class="l l2">已有账户？<a href="#" class="login">登录</a></div>
<form id="regForm">
	<div class="l"><input class="tel" name="tel" type="text" pattern= "^1[3|5|8|7|4|6]\d{9}" placeholder="请输入您的手机号(必填)" required /><i class="icon icon3"></i></div>
	<div class="l"><input class="username" name="username" type="text" placeholder="请输入您的真实姓名(必填)" required /><i class="icon"></i></div>
	<div class="l"><input class="pwd" name="pwd" type="password" placeholder="请设置密码，不少于6位(必填)" required /><i class="icon icon2"></i></div>
	<div class="l"><input class="ckpwd" name="checkpwd" type="password" placeholder="请再次输入密码(必填)" /><i class="icon icon2"></i></div>
	<div class="l"><input class="code" name="code" type="text" placeholder="请输入验证码(必填)" required /><a href="#" class="send">获取手机验证码</a></i></div>
	<div class="l"><input class="recmobile" name="recmobile" type="text" placeholder="请输入推荐人的手机号(选填)" /><i class="icon icon3"></i></div>
	<div class="btn">
		<a class="submit" href="#">提交注册</a>
	</div>
</form>
<div class="foot">
	注册即代表同意<a href="<%=domain%>/about/service" target="_blank" class="b">集沙成塔服务条款</a>
</div>