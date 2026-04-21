import React from 'react';
import { CourseLinksProps } from './types';

const CourseLinks: React.FC<CourseLinksProps> = ({ course, variant = 'mobile' }) => {
  const { deeplink, coursePaid } = course;
  const videoUrl = (course as any).videoUrl;

  if (!deeplink && !videoUrl && !coursePaid) {
    return null;
  }

  const links = [
    { url: deeplink, label: 'WhatsApp', color: 'blue' },
    { url: videoUrl, label: 'Video', color: 'red' },
    { url: coursePaid, label: 'Curso Pago', color: 'green' }
  ].filter(link => link.url);

  const containerClass = variant === 'mobile'
    ? 'mt-2 flex space-x-2'
    : 'mt-1 flex space-x-3';

  const linkBaseClass = 'text-xs underline';
  const colorClasses: Record<string, string> = {
    blue: 'text-blue-600 hover:text-blue-800',
    red: 'text-red-600 hover:text-red-800',
    green: 'text-green-600 hover:text-green-800'
  };

  return (
    <div className={containerClass}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${linkBaseClass} ${colorClasses[link.color]}`}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default CourseLinks;
