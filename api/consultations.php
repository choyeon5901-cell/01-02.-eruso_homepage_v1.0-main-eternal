<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

date_default_timezone_set('Asia/Seoul');

function respond(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function clean_string($value, int $maxLength): string
{
    $text = is_string($value) ? trim($value) : '';
    $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text) ?? '';

    if (function_exists('mb_substr')) {
        return mb_substr($text, 0, $maxLength, 'UTF-8');
    }

    return substr($text, 0, $maxLength);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, [
        'success' => false,
        'message' => 'POST 요청만 지원합니다.'
    ]);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || strlen($rawBody) > 65536) {
    respond(400, [
        'success' => false,
        'message' => '요청 본문을 확인해주세요.'
    ]);
}

$payload = json_decode($rawBody, true);
if (!is_array($payload)) {
    respond(400, [
        'success' => false,
        'message' => 'JSON 형식으로 요청해주세요.'
    ]);
}

$consultation = [
    'name' => clean_string($payload['name'] ?? '', 60),
    'phone' => clean_string($payload['phone'] ?? '', 20),
    'email' => clean_string($payload['email'] ?? '', 120),
    'serviceType' => clean_string($payload['serviceType'] ?? '', 80),
    'message' => clean_string($payload['message'] ?? '', 2000),
    'packageName' => clean_string($payload['packageName'] ?? '기본 추모관', 80),
];

if (
    $consultation['name'] === '' ||
    $consultation['phone'] === '' ||
    $consultation['email'] === '' ||
    $consultation['serviceType'] === '' ||
    $consultation['message'] === ''
) {
    respond(422, [
        'success' => false,
        'message' => '필수 항목을 모두 입력해주세요.'
    ]);
}

if (!preg_match('/^010-\d{3,4}-\d{4}$/', $consultation['phone'])) {
    respond(422, [
        'success' => false,
        'message' => '연락처는 010-0000-0000 형식으로 입력해주세요.'
    ]);
}

if (!filter_var($consultation['email'], FILTER_VALIDATE_EMAIL)) {
    respond(422, [
        'success' => false,
        'message' => '이메일 주소를 다시 확인해주세요.'
    ]);
}

$id = 'consult_' . date('Ymd_His') . '_' . bin2hex(random_bytes(4));
$savedAt = date(DATE_ATOM);
$record = array_merge([
    'id' => $id,
    'savedAt' => $savedAt,
    'ipHash' => hash('sha256', ($_SERVER['REMOTE_ADDR'] ?? '') . '|eruso-memorial-consultation'),
], $consultation);

$storageDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'storage';
$storageFile = $storageDir . DIRECTORY_SEPARATOR . 'consultations.jsonl';

if (!is_dir($storageDir) && !mkdir($storageDir, 0750, true)) {
    respond(500, [
        'success' => false,
        'message' => '상담 저장 공간을 만들지 못했습니다.'
    ]);
}

$handle = fopen($storageFile, 'ab');
if ($handle === false) {
    respond(500, [
        'success' => false,
        'message' => '상담 저장 파일을 열지 못했습니다.'
    ]);
}

$encodedRecord = json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
if ($encodedRecord === false) {
    fclose($handle);
    respond(500, [
        'success' => false,
        'message' => '상담 데이터를 저장 형식으로 변환하지 못했습니다.'
    ]);
}

if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    respond(500, [
        'success' => false,
        'message' => '상담 저장 파일을 잠그지 못했습니다.'
    ]);
}

$recordLine = $encodedRecord . PHP_EOL;
$written = fwrite($handle, $recordLine);
fflush($handle);
flock($handle, LOCK_UN);
fclose($handle);
@chmod($storageFile, 0640);

if ($written === false || $written < strlen($recordLine)) {
    respond(500, [
        'success' => false,
        'message' => '상담 데이터를 저장하지 못했습니다.'
    ]);
}

respond(201, [
    'success' => true,
    'id' => $id,
    'savedAt' => $savedAt,
    'message' => '상담 요청이 서버에 저장되었습니다.'
]);
