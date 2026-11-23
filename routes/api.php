<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DisposisiController;
use App\Http\Controllers\Api\MasterController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SuratKeluarController;
use App\Http\Controllers\Api\SuratMasukController;
use App\Http\Controllers\Api\UserManagementController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['api.auth', 'role:super_admin,pimpinan,admin_surat,staf'])->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/dashboard', DashboardController::class);

    Route::get('/units', [MasterController::class, 'units']);
    Route::get('/categories', [MasterController::class, 'categories']);
    Route::get('/users', [MasterController::class, 'users']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'readAll']);

    // === SURAT MASUK & DISPOSISI ===
    Route::get('/surat-masuk', [SuratMasukController::class, 'index']);
    Route::get('/surat-masuk/next-agenda', [SuratMasukController::class, 'nextAgenda']);
    Route::post('/surat-masuk', [SuratMasukController::class, 'store']);
    Route::get('/surat-masuk/{id}', [SuratMasukController::class, 'show']);
    Route::put('/surat-masuk/{id}', [SuratMasukController::class, 'update']);
    Route::delete('/surat-masuk/{id}', [SuratMasukController::class, 'destroy']);
    Route::get('/surat-masuk/{id}/lampiran/{lampiranId}/download', [SuratMasukController::class, 'download']);
    Route::post('/surat-masuk/{id}/disposisi', [DisposisiController::class, 'store']);
    Route::patch('/disposisi/{id}/status', [DisposisiController::class, 'updateStatus']);
});

// === SURAT KELUAR & USERS ===
Route::middleware(['api.auth', 'role:super_admin,pimpinan,admin_surat,staf'])->group(function (): void {
    Route::get('/surat-keluar', [SuratKeluarController::class, 'index']);
    Route::get('/surat-keluar/next-agenda', [SuratKeluarController::class, 'nextAgenda']);
    Route::post('/surat-keluar', [SuratKeluarController::class, 'store']);
    Route::get('/surat-keluar/{id}', [SuratKeluarController::class, 'show'])->whereNumber('id');
    Route::put('/surat-keluar/{id}', [SuratKeluarController::class, 'update'])->whereNumber('id');
    Route::delete('/surat-keluar/{id}', [SuratKeluarController::class, 'destroy'])->whereNumber('id');
});

Route::middleware(['api.auth', 'role:super_admin,admin_surat'])->group(function (): void {
    Route::get('/admin/users', [UserManagementController::class, 'index']);
    Route::post('/admin/users', [UserManagementController::class, 'store']);
    Route::put('/admin/users/{id}', [UserManagementController::class, 'update'])->whereNumber('id');
    Route::delete('/admin/users/{id}', [UserManagementController::class, 'destroy'])->whereNumber('id');
});
