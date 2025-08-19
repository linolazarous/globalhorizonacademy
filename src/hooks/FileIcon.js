const FileIcon = ({ type }) => {
  const iconConfig = {
    pdf: { color: 'text-red-500', icon: '📄' },
    ppt: { color: 'text-orange-500', icon: '📊' },
    doc: { color: 'text-blue-500', icon: '📝' },
    mp4: { color: 'text-purple-500', icon: '🎬' },
    jpg: { color: 'text-green-500', icon: '🖼️' },
    png: { color: 'text-green-500', icon: '🖼️' },
    default: { color: 'text-gray-500', icon: '📁' }
  };

  const fileType = type?.toLowerCase() || 'default';
  const config = iconConfig[fileType] || iconConfig.default;

  return (
    <span className={`text-2xl ${config.color}`}>
      {config.icon}
    </span>
  );
};

export default FileIcon;
