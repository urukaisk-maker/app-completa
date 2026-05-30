import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../../config/constants.dart';
import '../../../../core/errors/exceptions.dart';
import '../../../../core/network/dio_client.dart';
import '../models/auth_response_model.dart';

abstract class AuthRepository {
  Future<AuthResponseModel> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phone,
  });

  Future<AuthResponseModel> login({
    required String email,
    required String password,
  });

  Future<void> logout();

  Future<String?> getAccessToken();
}

class AuthRepositoryImpl implements AuthRepository {
  final Dio _dio;
  final _storage = const FlutterSecureStorage();

  AuthRepositoryImpl() : _dio = DioClient().instance;

  @override
  Future<AuthResponseModel> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    String? phone,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.register,
        data: {
          'firstName': firstName,
          'lastName': lastName,
          'email': email,
          'password': password,
          if (phone != null) 'phone': phone,
        },
      );
      final auth = AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
      await _saveTokens(auth.accessToken, auth.refreshToken);
      return auth;
    } on DioException catch (e) {
      final message = e.response?.data?['message']?.toString() ?? e.message;
      throw ServerException(message: message ?? 'Registration failed', statusCode: e.response?.statusCode);
    }
  }

  @override
  Future<AuthResponseModel> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        ApiConstants.login,
        data: {'email': email, 'password': password},
      );
      final auth = AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
      await _saveTokens(auth.accessToken, auth.refreshToken);
      return auth;
    } on DioException catch (e) {
      final message = e.response?.data?['message']?.toString() ?? e.message;
      throw ServerException(message: message ?? 'Login failed', statusCode: e.response?.statusCode);
    }
  }

  @override
  Future<void> logout() async {
    await _storage.deleteAll();
  }

  @override
  Future<String?> getAccessToken() async {
    return _storage.read(key: StorageKeys.accessToken);
  }

  Future<void> _saveTokens(String access, String refresh) async {
    await _storage.write(key: StorageKeys.accessToken, value: access);
    await _storage.write(key: StorageKeys.refreshToken, value: refresh);
  }
}
