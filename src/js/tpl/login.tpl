<h3>登录</h3>
<a href="#" class="close" data-role="close">X</a>
<form id="loginForm">
	<div class="l"><input class="tel" type="text" pattern= "^1[3|5|8|7|4|6]\d{9}" placeholder="手机号" required /><i class="icon"></i></div>
	<div class="l"><input class="pwd" type="password" pattern="^\w{6,}" placeholder="密码" required /><i class="icon icon2"></i></div>
	<p class="p"><a href="<%=url%>" target="_blank">忘记密码了？</a></p>
	<div class="btn">
		<a class="submit" href="#">登 录</a>
	</div>
</form>
<div class="foot">
	没有账户？<a href="#" target="_blank" class="b goreg">注册账户</a>
</div>