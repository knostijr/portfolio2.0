<?php
/**
 * Contact form endpoint for the portfolio.
 * Located in public/ → automatically copied to the root of the deployable
 * directory at build time. Called from the frontend via fetch('/send_mail.php').
 */

header('Content-Type: application/json; charset=utf-8');

// Only POST requests are allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
    exit;
}

// === CONFIGURATION ===
$TO_EMAIL    = 'christophkonst@icloud.com';
$SUBJECT     = 'New message via your portfolio';

// === COLLECT & SANITIZE INPUTS ===
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$message = trim($_POST['message'] ?? '');
$privacy = isset($_POST['privacy']);

// Honeypot field (optional — add a hidden 'website' input to the form):
// if (!empty($_POST['website'])) { http_response_code(200); echo json_encode(['ok'=>true]); exit; }

// === SERVER-SIDE VALIDATION (the frontend can be bypassed!) ===
$errors = [];
if (strlen($name) < 2)                                 $errors[] = 'name';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))        $errors[] = 'email';
if (strlen($message) < 10)                             $errors[] = 'message';
if (!$privacy)                                         $errors[] = 'privacy';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// === ASSEMBLE HEADERS (prevent mail injection) ===
$safeName  = preg_replace('/[\r\n]+/', ' ', $name);
$safeEmail = preg_replace('/[\r\n]+/', '', $email);

$headers   = [];
$headers[] = "From: Portfolio Contact <noreply@" . $_SERVER['HTTP_HOST'] . ">";
$headers[] = "Reply-To: $safeName <$safeEmail>";
$headers[] = "Content-Type: text/plain; charset=UTF-8";
$headers[] = "X-Mailer: PHP/" . phpversion();

$body  = "New contact request via your portfolio:\n\n";
$body .= "Name:    $name\n";
$body .= "Email:   $email\n\n";
$body .= "Message:\n$message\n";

// === SEND ===
$ok = mail($TO_EMAIL, $SUBJECT, $body, implode("\r\n", $headers));

if ($ok) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Mail dispatch failed']);
}