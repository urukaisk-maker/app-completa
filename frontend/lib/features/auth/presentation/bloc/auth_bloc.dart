import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;

  AuthBloc({required AuthRepository authRepository})
      : _authRepository = authRepository,
        super(AuthInitial()) {
    on<AuthLoginRequested>(_onLogin);
    on<AuthRegisterRequested>(_onRegister);
    on<AuthLogoutRequested>(_onLogout);
    on<AuthCheckSessionRequested>(_onCheckSession);
  }

  Future<void> _onLogin(AuthLoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final response = await _authRepository.login(
        email: event.email,
        password: event.password,
      );
      emit(AuthAuthenticated(user: response.user));
    } catch (e) {
      emit(AuthFailure(message: e.toString()));
    }
  }

  Future<void> _onRegister(AuthRegisterRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final response = await _authRepository.register(
        firstName: event.firstName,
        lastName: event.lastName,
        email: event.email,
        password: event.password,
        phone: event.phone,
      );
      emit(AuthAuthenticated(user: response.user));
    } catch (e) {
      emit(AuthFailure(message: e.toString()));
    }
  }

  Future<void> _onLogout(AuthLogoutRequested event, Emitter<AuthState> emit) async {
    await _authRepository.logout();
    emit(const AuthUnauthenticated());
  }

  Future<void> _onCheckSession(AuthCheckSessionRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    final token = await _authRepository.getAccessToken();
    if (token != null && token.isNotEmpty) {
      // TODO: validate token with backend /me endpoint
      emit(const AuthUnauthenticated());
    } else {
      emit(const AuthUnauthenticated());
    }
  }
}
