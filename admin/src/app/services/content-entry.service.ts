import { Injectable } from '@angular/core';
import { AngularFirestore, CollectionReference } from '@angular/fire/firestore';
import * as firebase from 'firebase/app';
import { map } from 'rxjs/operators';
import { ContentType } from './content-type.service';
import { Observable } from 'rxjs';

export type ContentEntryStatus = 'published' | 'unpublished' | 'deleted';

export interface ContentEntry {
  id: string; // Document id
  contentType: string;
  data: { [key: string]: any }; // The content data to render into templates
  title: string;  // Presentation title for browser window title and content listings
  url: {
    root: string, // The entry path root
    path: string, // The entry URL
  };
  revision: number; // Constantly increasing
  status: ContentEntryStatus;
  tags: string[];
  standalone: boolean;
  publishTime?: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  updatedAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
  createdAt: firebase.firestore.Timestamp | firebase.firestore.FieldValue;
}

export interface ContentTypeQueryOptions {
  limit?: number;
  orderBy?: {
    field: string,
    sortOrder: 'asc' | 'desc',
  };
}

@Injectable({
  providedIn: 'root'
})
export class ContentEntryService {

  constructor(
    private readonly firestore: AngularFirestore,
  ) { }

  getNewId() {
    return this.firestore.createId();
  }

  async create(contentType: ContentType, id: string = this.firestore.createId()) {
    return this.firestore
    .collection('tanam-entries').doc<ContentEntry>(id)
    .set({
      id: id,
      contentType: contentType.id,
      title: '',
      url: {
        root: contentType.slug,
        path: null,
      },
      revision: 0,
      standalone: contentType.standalone,
      status: 'unpublished',
      data: {},
      tags: [],
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    } as ContentEntry);
  }

  update(entry: ContentEntry) {
    if (!entry.id) {
      throw new Error('Document ID must be provided as an attribute when updating an entry.');
    }

    entry.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    return this.firestore
      .collection<ContentEntry>('tanam-entries').doc(entry.id)
      .update(entry);
  }

  delete(entryId: string) {
    if (!entryId) {
      throw new Error('Document ID must be provided as an attribute when deleting an entry.');
    }
    console.log(entryId);
    return this.firestore
      .collection<ContentEntry>('tanam-entries').doc(entryId)
      .delete();
  }

  findByUrl(root: string, path: string): Observable<ContentEntry> {
    console.log(`[ContentEntryService:findContentEntryByUrl] ${JSON.stringify({ root, path })}`);

    const queryFn = (ref: CollectionReference) =>
      ref.where('url.root', '==', root).where('url.path', '==', path).limit(1);

    return this.firestore
      .collection<ContentEntry>('tanam-entries', queryFn)
      .valueChanges()
      .pipe(map(entry => entry[0]));
  }

  get(entryId: string) {
    return this.firestore
      .collection('tanam-entries').doc<ContentEntry>(entryId)
      .valueChanges();
  }

  query(contentTypeId: string, queryOpts: ContentTypeQueryOptions = {}): Observable<ContentEntry[]> {
    console.log(`[ContentEntryService:getContentTypeFields] ${contentTypeId}, query=${JSON.stringify(queryOpts)}`);

    const queryFn = (ref: CollectionReference) => {
      let query = ref.where('contentType', '==', contentTypeId);

      if (queryOpts.orderBy) {
        query = query.orderBy(queryOpts.orderBy.field, queryOpts.orderBy.sortOrder);
      }

      if (queryOpts.limit) {
        query = query.limit(queryOpts.limit);
      }

      return query;
    };

    return this.firestore
      .collection<ContentEntry>('tanam-entries', queryFn)
      .valueChanges();
  }
}
