using LagStore.Api.DTOs;
using LagStore.Api.Models;
using LagStore.Api.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace LagStore.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;

        public AuthController(UserManager<ApplicationUser> userManager, ITokenService tokenService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponseDto>> Register(RegisterDto dto)
        {
            var existing = await _userManager.FindByEmailAsync(dto.Email);
            if (existing != null)
                return Conflict("Există deja un cont cu acest email.");

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors.Select(e => e.Description));

            await _userManager.AddToRoleAsync(user, "Client");

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(BuildResponse(user, roles));
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                return Unauthorized("Email sau parolă incorecte.");

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(BuildResponse(user, roles));
        }

        private AuthResponseDto BuildResponse(ApplicationUser user, IList<string> roles)
        {
            return new AuthResponseDto
            {
                Token = _tokenService.CreateToken(user, roles),
                Email = user.Email ?? string.Empty,
                FullName = user.FullName,
                Role = roles.FirstOrDefault() ?? string.Empty
            };
        }
    }
}