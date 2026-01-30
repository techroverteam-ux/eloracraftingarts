import { Modal, Button } from './ui';

export default function SessionTimeoutModal({ 
  isOpen, 
  timeLeft, 
  onExtendSession, 
  onLogout 
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside
      title="Session Timeout Warning"
      size="md"
    >
      <div className="text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold">!</span>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Your session will expire soon
          </h3>
          <p className="text-gray-600 mb-4">
            You will be automatically logged out in:
          </p>
          <div className="text-3xl font-bold text-red-600 mb-4">
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-gray-500">
            Click "Stay Logged In" to extend your session, or "Logout" to end your session now.
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onLogout}
            className="px-6"
          >
            Logout Now
          </Button>
          <Button
            variant="primary"
            onClick={onExtendSession}
            className="px-6"
          >
            Stay Logged In
          </Button>
        </div>
      </div>
    </Modal>
  );
}